class BlobService {
  private readonly blobKeyPrefix = 'BLOB-';
  private readonly dbName = 'MagicSpiderBlobs';
  private readonly storeName = 'blobs';
  private readonly dbVersion = 1;

  private dbPromise: Promise<IDBDatabase>;
  /** In-memory cache so freshly added blobs are readable before the async write settles. */
  private cache = new Map<string, string>();

  constructor() {
    this.dbPromise = this.openDb();
  }

  private generateKey(): string {
    return crypto.randomUUID();
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    return db.transaction(this.storeName, mode).objectStore(this.storeName);
  }

  private static request<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async put(key: string, image: string): Promise<void> {
    const store = await this.store('readwrite');
    await BlobService.request(store.put(image, key));
  }

  async getAllImages(): Promise<AppImage[]> {
    const store = await this.store('readonly');
    const [keys, values] = await Promise.all([
      BlobService.request(store.getAllKeys()),
      BlobService.request(store.getAll()),
    ]);
    return (keys as IDBValidKey[]).map((key, index) => {
      const id = String(key);
      const imageSrc = (values[index] as string) ?? '';
      this.cache.set(id, imageSrc);
      return { id, imageSrc };
    });
  }

  addImage(image: string): AppImage {
    const key = `${this.blobKeyPrefix}${this.generateKey()}`;
    this.cache.set(key, image);
    // Persist in the background; cache covers reads until the write settles.
    this.put(key, image).catch((err) =>
      console.error('Failed to persist blob', key, err),
    );
    return {
      id: key,
      imageSrc: image,
    };
  }

  removeImage(key: string): void {
    this.cache.delete(key);
    this.store('readwrite')
      .then((store) => BlobService.request(store.delete(key)))
      .catch((err) => console.error('Failed to remove blob', key, err));
  }

  async getImage(key: string): Promise<AppImage> {
    if (this.cache.has(key)) {
      return { id: key, imageSrc: this.cache.get(key)! };
    }
    const store = await this.store('readonly');
    const imageSrc = ((await BlobService.request(store.get(key))) as string) ?? '';
    this.cache.set(key, imageSrc);
    return {
      id: key,
      imageSrc,
    };
  }
}
const blobService: BlobService = new BlobService();
export default blobService;
export interface AppImage {
  id: string;
  imageSrc: string;
}
