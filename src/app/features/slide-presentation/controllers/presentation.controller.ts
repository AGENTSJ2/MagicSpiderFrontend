import { Observable } from 'rxjs';
import {
  PresentationEvent,
  PresentationEventStream,
} from '../domain/EventModels/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import {
  AddTextEvent,
  RemoveTextEvent,
  RestoreTextEvent,
  SelectTextEvent,
  TextEvent,
  UpdateTextEvent,
} from '../domain/EventModels/textEvent.model';
import {
  AddSlideEvent,
  RemoveSlideEvent,
  SlideEvent,
} from '../domain/EventModels/slideEvent.model';
import {
  AddShapeEvent,
  RemoveShapeEvent,
  RestoreShapeEvent,
  SelectShapeEvent,
  ShapeEvent,
  UpdateShapeEvent,
} from '../domain/EventModels/shapeEvent.models';
import {
  AddImageEvent,
  ImageEvent,
  RemoveImageEvent,
  RestoreImageEvent,
  SelectImageEvent,
  UpdateImageEvent,
} from '../domain/EventModels/imageEvent.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';
import {
  AddTrashEvents,
  RemoveFromTrashEvents,
  TrashEvent,
} from '../domain/EventModels/trashEvents.model';
import { TextComponent } from '../domain/canvasModels/textComponent.model';
import ShapeComponent from '../domain/canvasModels/shapeComponent.model';
import { ImageComponent } from '../domain/canvasModels/imageComponent';
import { RedoEvent, UndoEvent } from '../domain/EventModels/undoRedo.model';
import { slideService } from '../../../services/konva.services/slide.service';

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
        const lastEvent = this.eventHistory[this.eventIdx];
        let undoEvent: UndoEvent | undefined;
        const EventClass = lastEvent.constructor as new (
          init: PresentationEvent,
        ) => PresentationEvent;
        const newEvent = new EventClass({
          ...lastEvent,
          currentConfig: lastEvent.previousConfig,
          trackHistory: false,
        });
        undoEvent = new UndoEvent(newEvent);
        this.publishEvent(undoEvent!);
        this.eventIdx--;
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        const nextIdx = this.eventIdx + 1;
        if (nextIdx >= this.eventHistory.length) {
          return;
        }
        this.eventIdx = nextIdx;
        const nextEvent = this.eventHistory[this.eventIdx];
        const EventClass = nextEvent.constructor as new (
          init: PresentationEvent,
        ) => PresentationEvent;
        const newCopy = structuredClone(nextEvent);
        let redoEvent: RedoEvent | undefined;
        const newEvent = new EventClass({
          ...newCopy,
          trackHistory: false,
        });
        redoEvent = new RedoEvent(newEvent);
        this.publishEvent(redoEvent!);
      }
    });
  }

  destroy() {
    this.eventBus.complete();
  }
}
