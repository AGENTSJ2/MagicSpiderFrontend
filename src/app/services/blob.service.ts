import db from '../data/indexed-db';
import { Stores } from '../data/stores';

export class BlobService {
  private readonly blobKeyPrefix = 'BLOB-';
  static readonly storeName = Stores.blobs;
  static readonly descriptionStore = Stores.imageDescriptions;

  /** In-memory cache so freshly added blobs are readable before the async write settles. */
  private cache = new Map<string, string>();

  /** In-memory cache of image descriptions, keyed by the same blob key. */
  private descriptionCache = new Map<string, string>();

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
    const [keys, values, descKeys, descValues] = await Promise.all([
      db.getAllKeys<IDBValidKey>(BlobService.storeName),
      db.getAll<string>(BlobService.storeName),
      db.getAllKeys<IDBValidKey>(BlobService.descriptionStore),
      db.getAll<string>(BlobService.descriptionStore),
    ]);
    const descriptions = new Map<string, string>();
    descKeys.forEach((key, index) => {
      descriptions.set(String(key), descValues[index] ?? '');
    });
    return keys.map((key, index) => {
      const id = String(key);
      const imageSrc = values[index] ?? '';
      const description = descriptions.get(id) ?? '';
      this.cache.set(id, imageSrc);
      this.descriptionCache.set(id, description);
      return { id, imageSrc, description };
    });
  }

  addImage(image: string, description = ''): AppImage {
    const key = `${this.blobKeyPrefix}${this.generateKey()}`;
    this.cache.set(key, image);
    // Persist in the background; cache covers reads until the write settles.
    db.put(BlobService.storeName, key, image).catch((err) =>
      console.error('Failed to persist blob', key, err),
    );
    if (description) {
      this.updateDescription(key, description);
    }
    return {
      id: key,
      imageSrc: image,
      description,
    };
  }

  /** Set or clear the optional description stored alongside an image. */
  updateDescription(key: string, description: string): void {
    this.descriptionCache.set(key, description);
    db.put(BlobService.descriptionStore, key, description).catch((err) =>
      console.error('Failed to persist image description', key, err),
    );
  }

  removeImage(key: string): void {
    this.cache.delete(key);
    this.descriptionCache.delete(key);
    db.delete(BlobService.storeName, key).catch((err) =>
      console.error('Failed to remove blob', key, err),
    );
    db.delete(BlobService.descriptionStore, key).catch((err) =>
      console.error('Failed to remove image description', key, err),
    );
  }

  async getImage(key: string): Promise<AppImage> {
    if (this.cache.has(key)) {
      return {
        id: key,
        imageSrc: this.cache.get(key)!,
        description: this.descriptionCache.get(key) ?? '',
      };
    }
    await this.migration;
    const [imageSrc, description] = await Promise.all([
      db.get<string>(BlobService.storeName, key),
      db.get<string>(BlobService.descriptionStore, key),
    ]);
    this.cache.set(key, imageSrc ?? '');
    this.descriptionCache.set(key, description ?? '');
    return {
      id: key,
      imageSrc: imageSrc ?? '',
      description: description ?? '',
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
  /** Optional, user-editable description stored in the `imageDescriptions` store. */
  description?: string;
}
