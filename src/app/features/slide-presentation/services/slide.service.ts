import { Injectable } from '@angular/core';
import Konva from 'konva';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlideService {
  private presentationEvent: Subject<PresentationEvent> = new Subject();
  presentationEvents$ = this.presentationEvent.asObservable();
  addText(event: PresentationEvent) {
    this.presentationEvent.next(event);
  }
  updateText() {}
  addFile() {}
  updateFile() {}
  addShape() {}
  updateShape() {}
}
export interface PresentationEvent {
  presentationId: string;
  slideId: string;
  type: PresentationEventType;
}
export enum PresentationEventType {
  ADD_TEXT,
}
