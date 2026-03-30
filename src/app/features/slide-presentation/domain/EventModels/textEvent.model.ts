import { TextConfig } from "konva/lib/shapes/Text";
import { ComponentConfig, PresentationEvent } from "./presentationEvents.model";

export class TextEvent extends PresentationEvent {
    override currentConfig?: ComponentConfig<TextConfig>;
    override previousConfig?: ComponentConfig<TextConfig>;
    constructor(init:TextEvent) {
        super(init)
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
    }
}

export class AddTextEvent extends TextEvent {
    constructor(init:AddTextEvent)
    {
        super(init);
    }

}
export class UpdateTextEvent extends TextEvent {
    constructor(init:AddTextEvent)
    {
        super(init);
    }
}

export class RemoveTextEvent extends TextEvent {
    constructor(init:AddTextEvent)
    {
        super(init);
    }
}

export class SelectTextEvent extends TextEvent {
    constructor(init:AddTextEvent)
    {
        super(init);
    }
}