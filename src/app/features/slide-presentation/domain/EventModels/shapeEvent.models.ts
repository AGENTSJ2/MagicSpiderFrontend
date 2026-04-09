import { Shape } from "konva/lib/Shape";
import ShapeComponent, { ShapeType } from "../canvasModels/shapeComponent.model";
import { PresentationEvent } from "./presentationEvents.model";
import { ICanvasComponent } from "../canvasModels/ICanvasComponent";

export class ShapeEvent extends PresentationEvent {
    shapeType!: ShapeType;
    constructor(init: ShapeEvent) {
        super(init);
        this.shapeType = init.shapeType;
    }
}

export class AddShapeEvent extends ShapeEvent {
    constructor(init: ShapeEvent) {
        super(init);
    }
}
export class SelectShapeEvent extends ShapeEvent {
    constructor(init: ShapeEvent) {
        super(init);
    }
}

export class UpdateShapeEvent extends ShapeEvent {
    constructor(init: ShapeEvent) {
        super(init);
    }
}

export class RemoveShapeEvent extends ShapeEvent {
    constructor(init: ShapeEvent) {
        super(init);
    }
}

export class RestoreShapeEvent extends ShapeEvent {
    nodeToRestore: ShapeComponent;
    constructor(init: RestoreShapeEvent) {
        super(init);
        this.nodeToRestore = init.nodeToRestore;
    }
}