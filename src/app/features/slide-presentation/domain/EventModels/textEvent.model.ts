import { TextConfig } from "konva/lib/shapes/Text";
import { ShapeType } from "../canvasModels/shapeComponent.model";
import { ComponentConfig, PresentationEvent } from "./presentationEvents.model";

export class TextEvent extends PresentationEvent {
    override currentConfig?: ComponentConfig<TextConfig>;
    override previousConfig?: ComponentConfig<TextConfig>;
    constructor(init:TextEvent) {
        super(init)
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}