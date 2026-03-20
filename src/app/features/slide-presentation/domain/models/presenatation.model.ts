import { DocumentConfiguration } from "./documentConfiguration.model";
import { Slide } from "./slide.model";

export class Presentation {
    id: string;
    slides: Slide[];
    config: DocumentConfiguration;

    constructor(init?: Partial<Presentation>) {
        this.id = init?.id ?? crypto.randomUUID();
        this.slides = init?.slides ?? [];
        this.config = init?.config ?? { ratio: { num: 16, den: 9 }, pixelRatio: 1 };
    }
}