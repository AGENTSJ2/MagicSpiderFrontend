class BlobService {
  private readonly blobKeyPrefix = 'BLOB-';
  private generateKey(length = 8): string {
    const key = crypto.randomUUID();
    return key;
  }

  addImage(image: string): AppImage {
    const key = `${this.blobKeyPrefix}${this.generateKey()}`;
    localStorage.setItem(key, image);
    return {
      id: key,
      imageSrc: image,
    };
  }

  removeImage(key: string) {
    localStorage.removeItem(key);
  }

  getImage(key: string): AppImage {
    const imageSrc = localStorage.getItem(key) ?? '';
    return {
      id: key,
      imageSrc: imageSrc,
    };
  }
}
const blobService:BlobService = new BlobService();
export default blobService;
export interface AppImage {
  id: string;
  imageSrc: string;
}
