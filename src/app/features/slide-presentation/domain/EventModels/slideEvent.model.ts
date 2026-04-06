import { ShapeConfig } from "konva/lib/Shape";
import { ComponentConfig, PresentationEvent } from "./presentationEvents.model";
import { TextConfig } from "konva/lib/shapes/Text";

export class SlideEvent extends PresentationEvent {
    override currentConfig?: ComponentConfig<ShapeConfig>;
    override previousConfig?: ComponentConfig<TextConfig>;
    constructor(init:SlideEvent) {
        super(init)
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}

export class AddSlideEvent extends SlideEvent{
    constructor(init:AddSlideEvent)
    {
        super(init);
    }
}