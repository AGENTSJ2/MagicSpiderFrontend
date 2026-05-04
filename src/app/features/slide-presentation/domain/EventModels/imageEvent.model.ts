import { ImageConfig } from "konva/lib/shapes/Image";
import { ImageComponent } from "../canvasModels/imageComponent";
import { ComponentConfig, PresentationEvent, ZIndexActions } from "./presentationEvents.model";

export type SerializableImageConfig = Partial<ImageConfig> & { imageSrc?: string };

export class ImageEvent extends PresentationEvent {
    override currentConfig?: ComponentConfig<SerializableImageConfig>;
    override previousConfig?: ComponentConfig<SerializableImageConfig>;
    constructor(init: ImageEvent) {
        super(init);
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}

export class AddImageEvent extends ImageEvent {
    constructor(init: ImageEvent) {
        super(init);
    }
}

export class UpdateImageEvent extends ImageEvent {
    zIndexActions?: ZIndexActions;
    constructor(init: UpdateImageEvent) {
        super(init);
        this.zIndexActions = init.zIndexActions;
    }
}

export class RemoveImageEvent extends ImageEvent {
    constructor(init: ImageEvent) {
        super(init);
    }
}

export class SelectImageEvent extends ImageEvent {
    constructor(init: ImageEvent) {
        super(init);
    }
}

export class RestoreImageEvent extends ImageEvent {
    nodeToRestore: ImageComponent;
    constructor(init: RestoreImageEvent) {
        super(init);
        this.nodeToRestore = init.nodeToRestore;
    }
}
