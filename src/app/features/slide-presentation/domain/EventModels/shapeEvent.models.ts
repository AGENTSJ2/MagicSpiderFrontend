import { ShapeType } from "../canvasModels/shapeComponent.model";
import { PresentationEvent } from "./presentationEvents.model";

export class ShapeEvent extends PresentationEvent
{
    shapeType!:ShapeType;
    constructor(init:ShapeEvent)
    {
        super(init);
        this.shapeType = init.shapeType;
    }
}

export class AddShapeEvent extends ShapeEvent{
    constructor(init:ShapeEvent)
    {
        super(init);
    }
}
export class SelectShapeEvent extends ShapeEvent{
    constructor(init:ShapeEvent)
    {
        super(init);
    }
}

export class UpdateShapeEvent extends ShapeEvent{
    constructor(init:ShapeEvent)
    {
        super(init);
    }
}