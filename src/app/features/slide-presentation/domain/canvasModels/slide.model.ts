import SlideController from "../../controllers/slide.controller";
import { Shape } from "konva/lib/Shape";
import { PresentationEventStream } from "../EventModels/presentationEvents.model";

export class Slide {
    slideId: string;
    presentationId: string;
    components: Shape[];
    controller: SlideController;
    containerDiv!: HTMLDivElement;

    constructor(init: Partial<Slide> & { eventBus: PresentationEventStream }) {
        this.slideId = init.slideId!;
        this.presentationId = init.presentationId!;
        this.components = init.components ?? [];
        this.controller = new SlideController({ eventBus: init.eventBus, slide: this });
    }
}