import { ICanvasComponent } from "../canvasModels/ICanvasComponent";
import { PresentationEvent } from "./presentationEvents.model";

export class TrashEvent extends PresentationEvent {

}
export class AddTrashEvents extends TrashEvent
{
    node:ICanvasComponent;
    constructor(init:AddTrashEvents)
    {
        super(init);
        this.node = init.node;
    }
}
export class RemoveFromTrashEvents extends TrashEvent
{
    node:ICanvasComponent;
    constructor(init:AddTrashEvents)
    {
        super(init);
        this.node = init.node;
    }
}