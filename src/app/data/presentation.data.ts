import { Injectable } from '@angular/core';
import db from './indexed-db';

/** Full persisted shape of a presentation. */
export interface StoredPresentation {
  id: string;
  name: string;
  slides: any[];
  config: any;
  thumbnail: string;
}

/** Lightweight projection used to render listings without loading slide data. */
export interface StoredPresentationMeta {
  id: string;
  name?: string;
  slideCount: number;
  thumbnail: string;
}


@Injectable({ providedIn: 'root' })
export class PresentationData {
  private readonly recordStore = 'presentations';
  private readonly metaStore = 'presentationMeta';
  

  constructor() {
    db.createOrSetStore(this.recordStore);
    db.createOrSetStore(this.metaStore);
  }

  async get(id: string): Promise<StoredPresentation | undefined> {
    return db.get<StoredPresentation>(this.recordStore, id);
  }

  async list(): Promise<StoredPresentationMeta[]> {
    return db.getAll<StoredPresentationMeta>(this.metaStore);
  }

  async save(record: StoredPresentation): Promise<void> {
    await this.writeRecord(record);
  }

  async remove(id: string): Promise<void> {
    await Promise.all([
      db.delete(this.recordStore, id),
      db.delete(this.metaStore, id),
    ]);
  }

  private toMeta(record: StoredPresentation): StoredPresentationMeta {
    return {
      id: record.id,
      name: record.name,
      slideCount: record.slides?.length ?? 0,
      thumbnail: record.thumbnail,
    };
  }

  private async writeRecord(record: StoredPresentation): Promise<void> {
    await Promise.all([
      db.put(this.recordStore, record.id, record),
      db.put(this.metaStore, record.id, this.toMeta(record)),
    ]);
  }
}
