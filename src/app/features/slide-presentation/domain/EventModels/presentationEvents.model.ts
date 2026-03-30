import { TextConfig } from "konva/lib/shapes/Text";
import { ShapeType } from "../canvasModels/shapeComponent.model";
import { Subject } from "rxjs";
import { ShapeConfig } from "konva/lib/Shape";

export class PresentationEvent {
    nodeId:string;
    presentationId: string;
    slideId: string;
    // eventType:PresentationEventType;
    currentConfig?:ComponentConfig<ShapeConfig>;
    previousConfig?:ComponentConfig<ShapeConfig>;
    trackHistory:boolean;
    constructor(init:PresentationEvent) {
        this.nodeId = init.nodeId;
        this.presentationId = init.presentationId ?? '';
        this.slideId = init.slideId;
        // this.eventType = init.eventType;
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
        this.trackHistory = init.trackHistory;
    }
}
export interface ComponentConfig<T>{
    attrs:T;
    zIndex:number;
}
export class PresentationEventStream extends Subject<PresentationEvent> { }


export class ShapeEvent extends PresentationEvent
{
    shapeType!:ShapeType;
    constructor(init:ShapeEvent)
    {
        super(init);
        this.shapeType = init.shapeType;
    }
}
export class SlideEvent extends PresentationEvent {
    override currentConfig?: ComponentConfig<ShapeConfig>;
    override previousConfig?: ComponentConfig<TextConfig>;
    constructor(init:SlideEvent) {
        super(init)
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}
export enum PresentationEventType {
    ADD,
    UPDATE,
    REMOVE,
    SELECT
}
