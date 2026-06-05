import { Observable } from 'rxjs';
import {
  PresentationEvent,
  PresentationEventStream,
} from '../domain/EventModels/presentationEvents.model';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';

export class PresentationController {
  readonly eventBus: PresentationEventStream = new PresentationEventStream();
  private eventHistory: PresentationEvent[] = [];
  private eventIdx: number = -1;
  private readonly MAX_HISTORY_LENGTH = 100;
  private trash: ICanvasComponent[] = [];
  constructor(private presentation: Presentation) {
    this.registerEvent();
  }

  publishEvent(event: PresentationEvent) {
    this.eventBus.next(event);
  }

  listen(): Observable<PresentationEvent> {
    return this.eventBus.asObservable();
  }

  private registerEvent() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        if (this.eventIdx <= 0) {
          return;
        }
        // UNDO
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        const nextIdx = this.eventIdx + 1;
        if (nextIdx >= this.eventHistory.length) {
          return;
        }
        // REDO
      }
    });
  }

  destroy() {
    this.eventBus.complete();
  }
}
