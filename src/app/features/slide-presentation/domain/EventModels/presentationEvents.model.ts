import { TextConfig } from "konva/lib/shapes/Text";
import { ShapeType } from "../canvasModels/shapeComponent.model";
import { Subject } from "rxjs";
import { ShapeConfig } from "konva/lib/Shape";

export class PresentationEvent {
    nodeId:string;
    presentationId: string;
    slideId: string;
    currentConfig?:ComponentConfig<ShapeConfig>;
    previousConfig?:ComponentConfig<ShapeConfig>;
    trackHistory:boolean;
    constructor(init:PresentationEvent) {
        this.nodeId = init.nodeId;
        this.presentationId = init.presentationId ?? '';
        this.slideId = init.slideId;
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

export class UndoEvent extends PresentationEvent
{
    event:PresentationEvent;
    constructor(init:PresentationEvent)
    {
        super(init);
        this.event = init;
    };
}

export enum PresentationEventType {
    ADD,
    UPDATE,
    REMOVE,
    SELECT
}
