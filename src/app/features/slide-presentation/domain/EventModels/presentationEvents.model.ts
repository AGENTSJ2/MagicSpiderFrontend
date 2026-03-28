import { TextConfig } from "konva/lib/shapes/Text";
import { ShapeType } from "../canvasModels/shapeComponent.model";
import { Subject } from "rxjs";
import { ShapeConfig } from "konva/lib/Shape";

export class PresentationEvent {
    presentationId: string;
    slideId: string;
    eventType:PresentationEventType;
    currentConfig:ComponentConfig<ShapeConfig> ;
    previousConfig?:ComponentConfig<ShapeConfig>;
    constructor(init:PresentationEvent) {
        this.presentationId = init.presentationId ?? '';
        this.slideId = init.slideId;
        this.eventType = init.eventType;
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}
export interface ComponentConfig<T>{
    attrs:T;
    zIndex:number;
}
export class PresentationEventStream extends Subject<PresentationEvent> { }

export class TextEvent extends PresentationEvent {
    override currentConfig: ComponentConfig<TextConfig>;
    override previousConfig?: ComponentConfig<TextConfig>;
    constructor(init:TextEvent) {
        super(init)
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}
export class ShapeEvent extends PresentationEvent
{
    shapeType!:ShapeType;
    constructor(init:ShapeEvent)
    {
        super(init);
        this.shapeType = init.shapeType;
    }
}
export enum PresentationEventType {
    ADD_TEXT,
    UPDATE_TEXT,
    MOVE_TEXT,
    REMOVE_TEXT,
    ADD_SHAPE,
    ADD_IMAGE
}
