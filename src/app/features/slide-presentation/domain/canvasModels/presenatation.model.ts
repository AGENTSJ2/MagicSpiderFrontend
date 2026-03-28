import { PresentationController } from "../../controllers/presentation.controller";
import { DocumentConfiguration } from "../models/documentConfiguration.model";
import { Slide } from "./slide.model";

export class Presentation {
    id: string;
    slides: Slide[];
    config: DocumentConfiguration;
    controller:PresentationController = new PresentationController(this);
    
    constructor(init?: Partial<Presentation>) {
        this.id = init?.id ?? crypto.randomUUID();
        this.slides = init?.slides ?? [];
        this.config = init?.config ?? { ratio: { num: 16, den: 9 }, pixelRatio: 1 };
    }
}
