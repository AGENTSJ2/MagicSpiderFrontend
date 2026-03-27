import { Observable, Subject } from "rxjs";
import CanvasControllers from "./canvas.controller";
import { PresentationEvent } from "../domain/EventModels/presentationEvents.model";
import { Slide } from "../domain/canvasModels/slide.model";

export class PresentationController extends CanvasControllers {

    private eventBus: Subject<PresentationEvent> = new Subject();
    private eventHistory: PresentationEvent[] = [];

    constructor() {
        super();
        this.registerEvent();
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

    publishEvent(event: PresentationEvent) {
        this.eventHistory.push(event);
        this.eventBus.next(event);
    }

    listen(): Observable<PresentationEvent> {
        return this.eventBus.asObservable();
    }
    addSlide(): Slide {
        const slide: Partial<Slide> = {
            slideId: crypto.randomUUID().toString(),
            components: [],
        };
        const ConfiguredSlide = new Slide({ ...slide, eventBus: this.eventBus});
        return ConfiguredSlide;
    }
}