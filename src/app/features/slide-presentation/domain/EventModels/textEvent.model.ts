import { TextConfig } from "konva/lib/shapes/Text";
import { ComponentConfig, PresentationEvent, ZIndexActions } from "./presentationEvents.model";
import { TextComponent } from "../canvasModels/textComponent.model";

export class TextEvent extends PresentationEvent {
    override currentConfig?: ComponentConfig<TextConfig>;
    override previousConfig?: ComponentConfig<TextConfig>;
    constructor(init: TextEvent) {
        super(init)
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}

export class AddTextEvent extends TextEvent {
    constructor(init: AddTextEvent) {
        super(init);
    }

}
export class UpdateTextEvent extends TextEvent {
   zIndexActions?:ZIndexActions;
    constructor(init: UpdateTextEvent) {
        super(init);
        this.zIndexActions = init.zIndexActions;
    }
}

export class RemoveTextEvent extends TextEvent {
    constructor(init: TextEvent) {
        super(init);
    }
}

export class SelectTextEvent extends TextEvent {
    constructor(init: TextEvent) {
        super(init);
    }
}

export class RestoreTextEvent extends TextEvent {
    nodeToRestore:TextComponent;
    constructor(init: RestoreTextEvent) {
        super(init);
        this.nodeToRestore = init.nodeToRestore;
    }
}