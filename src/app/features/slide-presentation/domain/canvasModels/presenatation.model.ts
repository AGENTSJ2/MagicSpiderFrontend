import { PresentationController } from "../../controllers/presentation.controller";
import { PresentationEvent, PresentationEventStream } from "../EventModels/presentationEvents.model";
import { DocumentConfiguration } from "../models/documentConfiguration.model";
import { Slide } from "./slide.model";

export class Presentation {
    id: string;
    slides: Slide[];
    config: DocumentConfiguration;
    readonly controller:PresentationController = new PresentationController(this);
    readonly eventBus:PresentationEventStream;
    constructor(init?: Partial<Presentation>) {
        this.id = init?.id ?? crypto.randomUUID();
        this.slides = init?.slides ?? [];
        this.config = init?.config ?? { ratio: { num: 16, den: 9 }, pixelRatio: 1 };
        this.eventBus = this.controller.eventBus;
    }
    listenEvent()
    {
        return this.controller.listen();
    }
    publishEvent(event:PresentationEvent)
    {
        this.controller.publishEvent(event);
    }
}
