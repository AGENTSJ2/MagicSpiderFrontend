import { Shape, ShapeConfig } from "konva/lib/Shape";
import { ComponentConfig, PresentationEvent, PresentationEventStream, PresentationEventType } from "../domain/EventModels/presentationEvents.model";

export default abstract class BaseController {
    node: Shape;
    eventBus: PresentationEventStream;
    constructor(init: { node: Shape, eventBus: PresentationEventStream }) {
        this.node = init.node;
        this.eventBus = init.eventBus;
    }
    /**
     * Call all events inside this.
     * Override this if you need custom behavior.
     */
    protected abstract registerEvents():void;
    protected abstract getEventObject(data: {
        eventType: PresentationEventType;
        newConfig: ComponentConfig<ShapeConfig>;
        previousConfig?: ComponentConfig<ShapeConfig>;
        trackHistory?: boolean;
    }): PresentationEvent

    protected handleNodeClick(): void {
        this.node.on('click', () => {
            this.eventBus.next(
                this.getEventObject({
                    eventType: PresentationEventType.SELECT,
                    newConfig: { attrs: {}, zIndex: this.node.zIndex() },
                }),
            );
        });
    }
    // protected abstract handleNodeTransform():void;

} 