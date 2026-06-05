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
  private readonly MAX_HISTORY_LENGTH = 1000;
  private trash: ICanvasComponent[] = [];
  constructor(private presentation: Presentation) {
    this.registerEvent();
    this.listenToPresentationEvent()
  }

  listenToPresentationEvent()
  {
    this.eventBus.subscribe((event)=>{
      if(event.trackHistory)
      {
        if(this.eventHistory.length===this.MAX_HISTORY_LENGTH)
        {
          this.eventHistory.shift()
        }
        this.eventHistory.push(event);
        
      }
      console.log(event);
    })
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
