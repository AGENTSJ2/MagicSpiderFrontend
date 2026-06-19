class IndexedDb {
  private readonly dbPromise: Promise<IDBDatabase>;
  private db!: IDBDatabase;
  constructor(
    private readonly dbName: string,
    private readonly version: number,
  ) {
    this.dbPromise = this.open();
    this.dbPromise.then((iDb)=>{
      this.db = iDb;
    })
  }

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = () => {
        this.db = request.result;
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createOrSetStore(store: string) {
    await this.dbPromise;
    if (!this.db.objectStoreNames.contains(store)) {
      this.db.createObjectStore(store);
    }
  }

  private async objectStore(
    store: string,
    mode: IDBTransactionMode,
  ): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    return db.transaction(store, mode).objectStore(store);
  }

  private static request<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
    const os = await this.objectStore(store, 'readonly');
    return IndexedDb.request(os.get(key)) as Promise<T | undefined>;
  }

  async getAll<T>(store: string): Promise<T[]> {
    const os = await this.objectStore(store, 'readonly');
    return IndexedDb.request(os.getAll()) as Promise<T[]>;
  }

  async put(store: string, key: IDBValidKey, value: unknown): Promise<void> {
    const os = await this.objectStore(store, 'readwrite');
    await IndexedDb.request(os.put(value, key));
  }

  async delete(store: string, key: IDBValidKey): Promise<void> {
    const os = await this.objectStore(store, 'readwrite');
    await IndexedDb.request(os.delete(key));
  }
}
const db = new IndexedDb('MagicSpiderData', 1);
export default db;
