import { TextConfig } from "konva/lib/shapes/Text";
import { ShapeType } from "../canvasModels/shapeComponent.model";
import { Subject } from "rxjs";

export class PresentationEvent {
    presentationId: string;
    slideId: string;
    eventType:PresentationEventType;

    constructor(init:PresentationEvent) {
        this.presentationId = init.presentationId ?? '';
        this.slideId = init.slideId;
        this.eventType = init.eventType;
    }
}
export class PresentationEventStream extends Subject<PresentationEvent>
{

}

export class TextEvent extends PresentationEvent {
    currentConfig:TextConfig;
    previousConfig?:TextConfig;
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
