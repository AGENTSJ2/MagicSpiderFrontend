import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Slide } from "../domain/canvasModels/slide.model";
import BaseController from "./base.controller";
import { ComponentConfig, PresentationEventStream, PresentationEventType } from "../domain/EventModels/presentationEvents.model";
import { AddShapeEvent, RemoveShapeEvent, SelectShapeEvent, ShapeEvent, UpdateShapeEvent } from "../domain/EventModels/shapeEvent.models";
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
        this.listenPresentationEventStream();
        this.shapeType = init.shapeType
    }

    protected override destroy() {
        this.node.remove();
        this.slide.controller.removeSelectionOfComponent(this.node);
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
    }

    protected registerEvents() {
        super.handleNodeClick();
        super.handleTransformEvents();
        super.handleDragEvents();
        document.addEventListener('keydown', this.handleKeyboardStrokes);
    }

    protected listenPresentationEventStream() {
        this.eventBus.subscribe((event) => {
            if (!(event instanceof ShapeEvent) || event.nodeId != this.node.id()) {
                return;
            }
            if (event instanceof UpdateShapeEvent) {
                this.applyConfigurations(event.currentConfig!);
                return;
            }
            if (event instanceof RemoveShapeEvent) {
                this.destroy();
                return;
            }
        })
    }

    protected override  getEventObject(data: {
        eventType: PresentationEventType;
        newConfig: ComponentConfig<ShapeConfig>;
        previousConfig?: ComponentConfig<ShapeConfig>;
        trackHistory?: boolean;
    }): ShapeEvent {
        const defaultEvent: ShapeEvent = {
            presentationId: this.slide.presentationId,
            slideId: this.slide.slideId,
            trackHistory: true,
            nodeId: this.node.id(),
            shapeType: this.shapeType,
            currentConfig: {
                attrs: { ...structuredClone(this.node.getAttrs()), ...data.newConfig },
                zIndex: data.newConfig.zIndex
            },
            previousConfig: structuredClone(!data.previousConfig ? { attrs: this.node.getAttrs(), zIndex: this.node.zIndex() } : data.previousConfig),
        };

        switch (data.eventType) {
            case PresentationEventType.SELECT:
                return new SelectShapeEvent({
                    ...defaultEvent,
                });
            case PresentationEventType.ADD:
                return new AddShapeEvent(
                    { ...defaultEvent },
                );
            case PresentationEventType.UPDATE:
                return new UpdateShapeEvent(
                    { ...defaultEvent },
                );
            case PresentationEventType.REMOVE:
                return new RemoveShapeEvent(
                    { ...defaultEvent },
                );
            default:
                return new ShapeEvent({
                    ...defaultEvent
                });
        }
    }

    protected applyConfigurations(config: ComponentConfig<ShapeConfig>) {
        this.node.setAttrs(config);
        this.node.zIndex(config.zIndex);
    }

    protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (
            event.key === 'Delete' &&
            this.slide.controller.isNodeSelected(this.node)
        ) {
            super.handleRemove();
        }
    };
}