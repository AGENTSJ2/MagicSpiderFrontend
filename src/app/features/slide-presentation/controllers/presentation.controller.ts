import { Observable } from "rxjs";
import BaseController from "./base.controller";
import { PresentationEvent, PresentationEventStream, PresentationEventType, SlideEvent } from "../domain/EventModels/presentationEvents.model";
import { Slide } from "../domain/canvasModels/slide.model";
import { Presentation } from "../domain/canvasModels/presenatation.model";
import { TextEvent } from "../domain/EventModels/textEvent.model";
import { AddSlideEvent } from "../domain/EventModels/slideEvent.model";

export class PresentationController {

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
                    const EventClass = lastEvent.constructor as new (init: TextEvent) => TextEvent; // all wrong from here
                    undoEvent = new EventClass({
                        ...lastEvent,
                        currentConfig: lastEvent.previousConfig,
                        trackHistory: false,
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
                console.log(this.eventHistory);
                
                this.eventIdx = this.eventHistory.length - 1;
            }
            if (event instanceof SlideEvent) {
                if (event instanceof AddSlideEvent) {
                    const slide: Partial<Slide> = {
                        presentationId: this.presentation.id,
                        slideId: crypto.randomUUID().toString(),
                        components: [],
                    };
                    const ConfiguredSlide = new Slide({ ...slide, eventBus: this.eventBus });
                    this.presentation.slides.push(ConfiguredSlide);
                }
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