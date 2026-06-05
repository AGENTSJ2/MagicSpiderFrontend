import { Subject } from "rxjs";
import { ShapeConfig } from "konva/lib/Shape";

export class PresentationEvent {
    nodeId: string;
    presentationId: string;
    slideId: string;
    currentConfig?: ComponentConfig<ShapeConfig>;
    previousConfig?: ComponentConfig<ShapeConfig>;
    trackHistory: boolean;
    eventType:PresentationEventType;
    constructor(init: PresentationEvent) {
        this.nodeId = init.nodeId;
        this.presentationId = init.presentationId ?? '';
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

