import Konva from "konva";
import TextController from "../../controllers/text.controller";
import { Slide } from "./slide.model";
import { ICanvasComponent } from "./ICanvasComponent";

export class TextComponent  implements ICanvasComponent {
    x: number;
    y: number;
    textContent!: string;
    fontSize!: number;

    node: Konva.Text;
    slide: Slide;
    controller: TextController;

    constructor(init: Partial<TextComponent>) {
        this.x = init.x ?? 10;
        this.y = init.y ?? 10;
        this.textContent = init.textContent ?? "New Text";
        this.fontSize = init.fontSize ?? 50;
        this.slide = init.slide!;
        this.node = new Konva.Text({
            x: this.x,
            y: this.y,
            text: this.textContent,
            fontSize: this.fontSize,
            draggable: true,
        });

        this.controller = new TextController({
            slide: this.slide,
            content: this.textContent,
            textNode: this.node,
        });
    }
}