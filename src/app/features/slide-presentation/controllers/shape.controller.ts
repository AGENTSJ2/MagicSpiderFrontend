import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Slide } from "../domain/canvasModels/slide.model";
import BaseController from "./base.controller";
import { ComponentConfig, PresentationEvent, PresentationEventStream, PresentationEventType } from "../domain/EventModels/presentationEvents.model";
import { AddShapeEvent, SelectShapeEvent, ShapeEvent } from "../domain/EventModels/shapeEvent.models";
import { ShapeType } from "../domain/canvasModels/shapeComponent.model";

export default class ShapeController extends BaseController {
    override node: Shape;
    slide: Slide;
    shapeType: ShapeType

    constructor(init: {
        shape: Shape,
        slide: Slide,
        eventBus: PresentationEventStream,
        shapeType: ShapeType
    }) {
        super({ node: init.shape, eventBus: init.eventBus });
        this.node = init.shape;
        this.slide = init.slide;
        this.registerEvents();
        this.shapeType = init.shapeType
    }

    private destroy() {
        this.node.remove();
        this.slide.controller.removeSelectionOfComponent(this.node);
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
    }

    protected registerEvents() {
        super.handleNodeClick();
        this.node.on("dblclick", () => {
            const { x, y } = this.node.getAbsolutePosition();
        });
        this.node.on("dragend", () => {
            console.log("Drag ended");
        });
        document.addEventListener('keydown', this.handleKeyboardStrokes);
        this.node.on('transform', () => {
            const scaleX = this.node.scaleX();
            const scaleY = this.node.scaleY();
            // Apply scale to actual size
            this.node.width(this.node.width() * scaleX);
            this.node.height(this.node.height() * scaleY);

            // Reset scale
            this.node.scaleX(1);
            this.node.scaleY(1);
        });
    }
    protected override  getEventObject(data: {
        eventType: PresentationEventType;
        newConfig: ComponentConfig<ShapeConfig>;
        previousConfig?: ComponentConfig<ShapeConfig>;
        trackHistory?: boolean;
    }): ShapeEvent {
        const commonConfig: ShapeEvent = {
            presentationId: this.slide.presentationId,
            slideId: this.slide.slideId,
            trackHistory: true,
            nodeId: this.node.id(),
            shapeType: this.shapeType,
            previousConfig: structuredClone(!data.previousConfig ? { attrs: this.node.getAttrs(), zIndex: this.node.zIndex() } : data.previousConfig)
        };

        switch (data.eventType) {
            case PresentationEventType.SELECT:
                return new SelectShapeEvent({
                    ...commonConfig,
                });
            case PresentationEventType.ADD:
                return new AddShapeEvent(
                    { ...commonConfig },
                );
            default:
                return new ShapeEvent({
                   ...commonConfig
                });
        }
    }

    private handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (event.key === 'Delete' && this.slide.controller.isNodeSelected(this.node)) {
            this.destroy();
        }
    }
}