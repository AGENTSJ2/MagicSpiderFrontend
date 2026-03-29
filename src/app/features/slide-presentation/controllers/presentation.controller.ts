import { Observable } from "rxjs";
import BaseController from "./base.controller";
import { PresentationEvent, PresentationEventStream, PresentationEventType, TextEvent } from "../domain/EventModels/presentationEvents.model";
import { Slide } from "../domain/canvasModels/slide.model";
import { Presentation } from "../domain/canvasModels/presenatation.model";

export class PresentationController  {

    private eventBus: PresentationEventStream = new PresentationEventStream();
    private eventHistory: PresentationEvent[] = [];
    private eventIdx: number = -1;
    private readonly MAX_HISTORY_LENGTH = 100;
    constructor(private presentation: Presentation) {

        this.registerEvent();
        this.listenPresentationEvents();
    }

    private registerEvent() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'z') {
                if (this.eventIdx <= 0) {
                    return;
                }
                const lastEvent = this.eventHistory[this.eventIdx];
                let undoEvent: PresentationEvent | undefined;

                if (lastEvent instanceof TextEvent) {
                    undoEvent = new TextEvent({
                        ...lastEvent,
                        currentConfig: lastEvent.previousConfig,
                        trackHistory: false,
                        eventType: PresentationEventType.UPDATE_TEXT
                    })
                }
                this.publishEvent(
                    undoEvent!
                )
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
                if (this.eventIdx != this.eventHistory.length - 1) { // some operation is performed after undo / redo hence reset
                    this.eventHistory.splice(this.eventIdx + 1)
                }
                if (this.eventHistory.length >= this.MAX_HISTORY_LENGTH) {
                    this.eventHistory.shift(); // remove from the start 
                }
                this.eventHistory.push(event);
                this.eventIdx = this.eventHistory.length - 1;
            }

            switch (event.eventType) {
                case PresentationEventType.ADD_SLIDE:
                    const slide: Partial<Slide> = {
                        presentationId: this.presentation.id,
                        slideId: crypto.randomUUID().toString(),
                        components: [],
                    };
                    const ConfiguredSlide = new Slide({ ...slide, eventBus: this.eventBus });
                    this.presentation.slides.push(ConfiguredSlide);
                    break;
                default:
                    return;
            }
        });
    }

    publishEvent(event: PresentationEvent) {
        this.eventBus.next(event);
    }

    listen(): Observable<PresentationEvent> {
        return this.eventBus.asObservable();
    }

    destroy() {
        this.eventBus.complete();
    }
}