import { Subject } from "rxjs";
import { ShapeConfig } from "konva/lib/Shape";
import type { Presentation } from "../canvasModels/presenatation.model";
import type { Slide } from "../canvasModels/slide.model";

export class PresentationEvent {
    readonly nodeId: string;
    readonly presentationId: string;
    readonly slideId?: string;
    readonly currentConfig?: ComponentConfig<ShapeConfig>;
    readonly previousConfig?: ComponentConfig<ShapeConfig>;
    readonly trackHistory: boolean;
    readonly eventType:PresentationEventType;

    constructor(init: PresentationEvent) {
        this.nodeId = init.nodeId;
        this.presentationId = init.presentationId;
        this.slideId = init.slideId;
        this.currentConfig = init.currentConfig;
        this.previousConfig = init.previousConfig;
        this.trackHistory = init.trackHistory;
        this.eventType = init.eventType;
    }
}

export interface ComponentConfig<T> {
    attrs: T;
    zIndex: number;
}

export class PresentationEventStream extends Subject<PresentationEvent> { }

export enum ZIndexActions {
    moveToFront,
    moveToBack,
    moveUp,
    moveDown
}

export enum PresentationEventType {
    ADD,
    UPDATE,
    REMOVE,
    SELECT,
    RESTORE,
    CLEAR_SELECT
}

