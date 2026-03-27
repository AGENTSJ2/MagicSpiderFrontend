import { Subject } from "rxjs";
import SlideController from "../../controllers/slide.controller";
import { Shape } from "konva/lib/Shape";
import { PresentationEvent } from "../EventModels/presentationEvents.model";

export class Slide {
    slideId!: string;
    components!: Shape[];
    controller!: SlideController;
    containerDiv!: HTMLDivElement;

    constructor(init: Partial<Slide> & { eventBus: Subject<PresentationEvent> }) {
        this.slideId = init.slideId ?? '';
        this.components = init.components ?? [];
        this.controller = new SlideController({ eventBus: init.eventBus, slide: this });
    }
}