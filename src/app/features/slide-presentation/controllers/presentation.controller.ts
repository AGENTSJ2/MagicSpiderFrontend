import { Observable } from "rxjs";
import CanvasControllers from "./canvas.controller";
import { PresentationEvent, PresentationEventStream, PresentationEventType } from "../domain/EventModels/presentationEvents.model";
import { Slide } from "../domain/canvasModels/slide.model";
import { Presentation } from "../domain/canvasModels/presenatation.model";

export class PresentationController extends CanvasControllers {

    private eventBus: PresentationEventStream = new PresentationEventStream();
    private eventHistory: PresentationEvent[] = [];
    private eventIdx: number = -1;
    constructor(private presentation: Presentation) {
        super();
        this.registerEvent();
        this.listenPresentationEvents();
    }

    private registerEvent() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key.toLowerCase() === 'z') {
                console.log('Undo');
            }

            if (event.ctrlKey && event.key.toLowerCase() === 'y') {
                console.log('Redo');
            }
        });
    }

    private listenPresentationEvents() {
        this.eventBus.subscribe((event) => {
            if (event.trackHistory) {
                this.eventHistory.push(event);
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
                default :
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