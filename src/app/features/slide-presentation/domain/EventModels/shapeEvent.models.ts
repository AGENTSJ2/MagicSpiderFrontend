import ShapeComponent, { ShapeType } from "../canvasModels/shapeComponent.model";
import { ComponentConfig, PresentationEvent, ZIndexActions } from "./presentationEvents.model";
import { ShapeConfig } from "konva/lib/Shape";

export class ShapeEvent extends PresentationEvent {
    shapeType!: ShapeType;
    override currentConfig?: ComponentConfig<ShapeConfig>;
    override previousConfig?: ComponentConfig<ShapeConfig>;
    constructor(init: ShapeEvent) {
        super(init);
        this.shapeType = init.shapeType;
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
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
    zIndexActions?: ZIndexActions;
    constructor(init: UpdateShapeEvent) {
        super(init);
        this.zIndexActions = init.zIndexActions;
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
