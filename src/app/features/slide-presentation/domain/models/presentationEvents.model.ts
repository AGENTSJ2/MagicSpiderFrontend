import { ShapeType } from "../canvasModels/shapeComponent.model";

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
export class TextEvent extends PresentationEvent {
    textContent: string;
    constructor(init:TextEvent) {
        super(init)
        this.textContent = init.textContent;
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
