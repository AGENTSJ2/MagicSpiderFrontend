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
  private readonly MAX_TRASH_LENGTH = 1000;
  private TRASH_BIN: ICanvasComponent[] = [];

  constructor(private presentation: Presentation) {
    this.registerEvent();
    this.listenToPresentationEvent();
  }

  listenToPresentationEvent() {
    this.eventBus.subscribe((event) => {
      if (event.trackHistory) {
        if (this.eventIdx != this.eventHistory.length - 1) {
          this.eventHistory.length = this.eventIdx + 1;
        }
        if (this.eventHistory.length === this.MAX_HISTORY_LENGTH) {
          this.eventHistory.shift();
        }
        this.eventHistory.push(event);
        this.eventIdx++;
      }
    });
  }

  listen(): Observable<PresentationEvent> {
    return this.eventBus.asObservable();
  }

  private registerEvent() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'z') {
        this.handleUndo();
      }

      if (event.ctrlKey && event.key.toLowerCase() === 'y') {
        this.handleRedo();
      }
    });
  }

  private handleUndo() {
    console.log(this.eventIdx);
    if (this.eventIdx < 0) {
      return;
    }

    const event = this.eventHistory.at(this.eventIdx);
    // improve this search
    let component = this.presentation.slides
      .find((sl) => sl.slideId == event?.slideId)
      ?.components.find((cm) => cm.node._id.toString() == event?.nodeId);
    if (!component) {
      component = this.TRASH_BIN.find(
        (cm) => cm.node._id.toString() == event?.nodeId,
      );
    }
    component?.controller.undoEvent(event!);
    this.eventIdx--;
  }
  private handleRedo() {
    const nextIdx = this.eventIdx + 1;
    console.log(nextIdx, this.eventHistory.length);

    if (nextIdx >= this.eventHistory.length) {
      return;
    }
    const event = this.eventHistory.at(nextIdx);
    let component = this.presentation.slides
      .find((sl) => sl.slideId == event?.slideId)
      ?.components.find((cm) => cm.node._id.toString() == event?.nodeId);
    if (!component) {
      component = this.TRASH_BIN.find(
        (cm) => cm.node._id.toString() == event?.nodeId,
      );
    }
    component?.controller.redoEvent(event!);
    this.eventIdx++;
  }

  addToTrash(component: ICanvasComponent) {
    if (this.TRASH_BIN.length == this.MAX_TRASH_LENGTH) {
      const trashed = this.TRASH_BIN.shift();
      trashed?.destroy();
    }
    this.TRASH_BIN.push(component);
  }

  takeFromTrash(nodeId: string) {
    const index = this.TRASH_BIN.findIndex(
      (binElm) => binElm.node._id.toString() == nodeId,
    );
    if (index < 0 ) {
      return undefined;
    }
    const trashedElm = this.TRASH_BIN.splice(index, 1)[0];
    return trashedElm;
  }
  destroy() {
    this.eventBus.complete();
  }
}
