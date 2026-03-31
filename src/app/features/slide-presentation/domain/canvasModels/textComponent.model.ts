import Konva from "konva";
import TextController from "../../controllers/text.controller";
import { Slide } from "./slide.model";
import { ICanvasComponent } from "./ICanvasComponent";
import { ComponentConfig, PresentationEventStream } from "../EventModels/presentationEvents.model";
import { TextConfig } from "konva/lib/shapes/Text";

export class TextComponent  implements ICanvasComponent {
    node: Konva.Text;
    config:ComponentConfig<TextConfig>;
    slide: Slide;
    controller: TextController;
    constructor(init: Partial<TextComponent> & {eventBus:PresentationEventStream}) {        
        this.config = init.config!;
        this.slide = init.slide!;
        this.node = new Konva.Text({
            ...this.config.attrs,
            x: init.config?.attrs.x ?? 10,
            y: init.config?.attrs.y ?? 10,
            text: init.config?.attrs.text ?? "New Text",
            fontSize: init.config?.attrs.fontSize ?? 50,
            draggable: true,
        });
        this.controller = new TextController({
            slide: this.slide,
            textNode: this.node,
            eventBus:init.eventBus
        });
    }
}