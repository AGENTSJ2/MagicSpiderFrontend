import SlideController from "../../controllers/slide.controller";
import { Shape } from "konva/lib/Shape";

export class Slide {
    slideId!: string;
    components!: Shape[];
    controller!:SlideController;

    constructor(init:Partial<Slide>)
    {
        this.slideId = init.slideId ?? '';
        this.components = init.components ?? [];
        this.controller = new SlideController();
    }
}