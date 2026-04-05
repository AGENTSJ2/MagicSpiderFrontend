import { Observable } from 'rxjs';
import {
  PresentationEvent,
  PresentationEventStream,
  UndoEvent,
} from '../domain/EventModels/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import {
  AddTextEvent,
  RemoveTextEvent,
  SelectTextEvent,
  TextEvent,
  UpdateTextEvent,
} from '../domain/EventModels/textEvent.model';
import {
  AddSlideEvent,
  SlideEvent,
} from '../domain/EventModels/slideEvent.model';
import { AddShapeEvent, RemoveShapeEvent, SelectShapeEvent, ShapeEvent, UpdateShapeEvent } from '../domain/EventModels/shapeEvent.models';

export class PresentationController {
  private eventBus: PresentationEventStream = new PresentationEventStream();
  private eventHistory: PresentationEvent[] = [];
  private eventIdx: number = -1;
  private readonly MAX_HISTORY_LENGTH = 100;
  constructor(private presentation: Presentation) {
    this.registerEvent();
    this.listenPresentationEvents();
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
          init: TextEvent,
        ) => TextEvent; // all wrong from here
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
        console.log('Redo');
      }
    });
  }

  private listenPresentationEvents() {
    this.eventBus.subscribe((event) => {

      if (event.trackHistory) {
        if (this.eventIdx != this.eventHistory.length - 1) {
          // some operation is performed after undo / redo hence reset
          this.eventHistory.splice(this.eventIdx + 1);
        }
        if (this.eventHistory.length >= this.MAX_HISTORY_LENGTH) {
          this.eventHistory.shift(); // remove from the start
        }
        this.eventHistory.push(event);
        this.eventIdx = this.eventHistory.length - 1;
      }
      if (event instanceof SlideEvent) {
        if (event instanceof AddSlideEvent) {
          const slide: Partial<Slide> = {
            presentationId: this.presentation.id,
            slideId: crypto.randomUUID().toString(),
            components: [],
          };
          const ConfiguredSlide = new Slide({
            ...slide,
            eventBus: this.eventBus,
          });
          this.presentation.slides.push(ConfiguredSlide);
          return;
        }
        return;
      }

      if (event instanceof UndoEvent) {
        if (event.event instanceof TextEvent) {
          this.handleUndoTextEvent(event.event);
          return;
        }
        if (event.event instanceof ShapeEvent) {
          this.handleUndoShapeEvent(event.event);
          return;
        }
      }
    });
  }

  private handleUndoTextEvent(event: TextEvent) {
    if (event instanceof AddTextEvent) {
      const removeEvent = new RemoveTextEvent({
        ...event,
        trackHistory: false,
      });
      this.publishEvent(removeEvent);
      return;
    }
    if (event instanceof RemoveTextEvent) {
      const addEvent = new AddTextEvent({
        ...event,
        currentConfig: event.previousConfig,
        trackHistory: false,
      });
      this.publishEvent(addEvent);
      return;
    }
    if (event instanceof UpdateTextEvent) {
      const newEvent = new UpdateTextEvent({
        ...event,
      });
      newEvent.trackHistory = false;
      this.publishEvent(newEvent);
      return;
    }
    if (event instanceof SelectTextEvent) {
      const newEvent = new SelectTextEvent({
        ...event,
      });
      newEvent.trackHistory = false;
      this.publishEvent(newEvent);
      return;
    }
  }

  private handleUndoShapeEvent(event: ShapeEvent) {
    if (event instanceof AddShapeEvent) {
      const removeEvent = new RemoveShapeEvent({
        ...event,
        trackHistory: false,
      });
      this.publishEvent(removeEvent);
      return;
    }
    if (event instanceof RemoveShapeEvent) {
      const addEvent = new AddShapeEvent({
        ...event,
        currentConfig: event.previousConfig,
        trackHistory: false,
      });
      this.publishEvent(addEvent);
      return;
    }
    if (event instanceof UpdateShapeEvent) {
      const newEvent = new UpdateShapeEvent({
        ...event,
      });
      newEvent.trackHistory = false;
      this.publishEvent(newEvent);
      return;
    }
    if (event instanceof SelectShapeEvent) {
      const newEvent = new SelectShapeEvent({
        ...event,
      });
      newEvent.trackHistory = false;
      this.publishEvent(newEvent);
      return;
    }
  }

  destroy() {
    this.eventBus.complete();
  }
}
