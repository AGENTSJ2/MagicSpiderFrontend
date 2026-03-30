import { SlideEvent } from "./presentationEvents.model";

export class AddSlideEvent extends SlideEvent{
    constructor(init:AddSlideEvent)
    {
        super(init);
    }
}