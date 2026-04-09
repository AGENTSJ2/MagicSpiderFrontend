import { PresentationEvent } from "./presentationEvents.model";

export class UndoEvent extends PresentationEvent
{
    event:PresentationEvent;
    constructor(init:PresentationEvent)
    {
        super(init);
        this.event = init;
    };
}

export class RedoEvent extends PresentationEvent
{
    event:PresentationEvent;
    constructor(init:PresentationEvent)
    {
        super(init);
        this.event = init;
    };
}