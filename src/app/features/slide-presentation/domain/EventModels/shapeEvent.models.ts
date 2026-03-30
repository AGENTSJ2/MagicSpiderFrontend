import { ShapeEvent } from "./presentationEvents.model";

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