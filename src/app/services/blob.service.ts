class BlobService {
  private readonly blobKeyPrefix = 'BLOB-';
  private readonly blobsListKey = "BLOB-LIST"
  blobKeys:Set<string> ;
  constructor()
  {
    this.blobKeys = this.getAllBlobKeys();
  }

  private generateKey(length = 8): string {
    const key = crypto.randomUUID();
    return key;
  }

  private getAllBlobKeys():Set<string>
  {
    const keyString = localStorage.getItem(this.blobsListKey)?.trim() ?? '[]';
    console.log(keyString);
    const keys = JSON.parse(keyString);
    console.log(keys);
    return new Set(keys);
  }
  
  private addBlobKeyToList(blobKey:string)
  {
    this.blobKeys.add(blobKey);
    localStorage.setItem(this.blobsListKey,JSON.stringify([...this.blobKeys]));
  }

  private removeFromBlobKeyList(blobKey:string)
  {
    this.blobKeys.delete(blobKey);
    localStorage.setItem(this.blobsListKey,JSON.stringify([...this.blobKeys]));
  }
  
  getAllImages()
  {
    const keySet = this.getAllBlobKeys();
    console.log(keySet);
    
    const images:AppImage[ ] = [];
    keySet.forEach((key)=>{
      images.push(this.getImage(key))
    })
    return images;
  }

  addImage(image: string): AppImage {
    const key = `${this.blobKeyPrefix}${this.generateKey()}`;
    localStorage.setItem(key, image);
    this.addBlobKeyToList(key);
    return {
      id: key,
      imageSrc: image,
    };
  }

  removeImage(key: string) {
    localStorage.removeItem(key);
    this.removeFromBlobKeyList(key);
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
