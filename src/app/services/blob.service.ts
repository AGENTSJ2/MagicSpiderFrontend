import db from '../data/indexed-db';
import { Stores } from '../data/stores';

export class BlobService {
  private readonly blobKeyPrefix = 'BLOB-';
  static readonly storeName = Stores.blobs;

  /** In-memory cache so freshly added blobs are readable before the async write settles. */
  private cache = new Map<string, string>();

  /** Resolves once blobs from the legacy `MagicSpiderBlobs` DB have been imported. */
  private readonly migration: Promise<void>;

  constructor() {
    this.migration = this.migrateLegacyDb();
  }

  private generateKey(): string {
    return crypto.randomUUID();
  }

  async getAllImages(): Promise<AppImage[]> {
    await this.migration;
    const [keys, values] = await Promise.all([
      db.getAllKeys<IDBValidKey>(BlobService.storeName),
      db.getAll<string>(BlobService.storeName),
    ]);
    return keys.map((key, index) => {
      const id = String(key);
      const imageSrc = values[index] ?? '';
      this.cache.set(id, imageSrc);
      return { id, imageSrc };
    });
  }

  addImage(image: string): AppImage {
    const key = `${this.blobKeyPrefix}${this.generateKey()}`;
    this.cache.set(key, image);
    // Persist in the background; cache covers reads until the write settles.
    db.put(BlobService.storeName, key, image).catch((err) =>
      console.error('Failed to persist blob', key, err),
    );
    return {
      id: key,
      imageSrc: image,
    };
  }

  removeImage(key: string): void {
    this.cache.delete(key);
    db.delete(BlobService.storeName, key).catch((err) =>
      console.error('Failed to remove blob', key, err),
    );
  }

  async getImage(key: string): Promise<AppImage> {
    if (this.cache.has(key)) {
      return { id: key, imageSrc: this.cache.get(key)! };
    }
    await this.migration;
    const imageSrc = (await db.get<string>(BlobService.storeName, key)) ?? '';
    this.cache.set(key, imageSrc);
    return {
      id: key,
      imageSrc,
    };
  }

  /**
   * Blobs previously lived in their own `MagicSpiderBlobs` database. Copy any
   * existing blobs into the shared DB, then drop the legacy database. Guarded by
   * a localStorage flag and idempotent (writes are keyed), so it's safe to retry.
   */
  private migrateLegacyDb(): Promise<void> {
    const legacyDbName = 'MagicSpiderBlobs';
    const flagKey = 'blobs-migrated';
    return new Promise<void>((resolve) => {
      if (localStorage.getItem(flagKey)) {
        resolve();
        return;
      }
      const request = indexedDB.open(legacyDbName);
      request.onerror = () => resolve();
      request.onsuccess = async () => {
        const legacy = request.result;
        try {
          if (legacy.objectStoreNames.contains(BlobService.storeName)) {
            const store = legacy
              .transaction(BlobService.storeName, 'readonly')
              .objectStore(BlobService.storeName);
            const [keys, values] = await Promise.all([
              promisify<IDBValidKey[]>(store.getAllKeys()),
              promisify<string[]>(store.getAll()),
            ]);
            await Promise.all(
              keys.map((key, i) => db.put(BlobService.storeName, key, values[i])),
            );
          }
        } catch (err) {
          console.error('Failed to migrate blobs to shared DB', err);
        } finally {
          legacy.close();
          indexedDB.deleteDatabase(legacyDbName);
          localStorage.setItem(flagKey, 'true');
          resolve();
        }
      };
    });
  }
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const blobService: BlobService = new BlobService();
export default blobService;
export interface AppImage {
  id: string;
  imageSrc: string;
}
