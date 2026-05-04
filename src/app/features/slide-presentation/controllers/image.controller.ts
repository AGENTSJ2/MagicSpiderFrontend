import { Image as KonvaImage, ImageConfig } from "konva/lib/shapes/Image";
import { ComponentConfig, PresentationEventStream, PresentationEventType, ZIndexActions } from "../domain/EventModels/presentationEvents.model";
import { AddImageEvent, ImageEvent, RemoveImageEvent, SelectImageEvent, SerializableImageConfig, UpdateImageEvent } from "../domain/EventModels/imageEvent.model";
import { Slide } from "../domain/canvasModels/slide.model";
import BaseController from "./base.controller";

export default class ImageController extends BaseController {
    override node: KonvaImage;
    private slide: Slide;

    constructor(init: {
        slide: Slide,
        imageNode: KonvaImage,
        eventBus: PresentationEventStream,
    }) {
        super({ node: init.imageNode, eventBus: init.eventBus });
        this.slide = init.slide;
        this.node = init.imageNode;
        this.registerEvents();
        this.listenPresentationEventStream();
    }

    protected registerEvents(): void {
        this.handleNodeClick();
        this.handleTransformEvents();
        this.handleDragEvents();
        document.addEventListener('keydown', this.handleKeyboardStrokes);
    }

    protected listenPresentationEventStream(): void {
        this.eventBus.subscribe((event) => {
            if (!(event instanceof ImageEvent) || event.nodeId != this.node._id.toString()) {
                return;
            }
            if (event instanceof UpdateImageEvent) {
                this.applyConfigurations(event);
            }
        });
    }

    override destroy(): void {
        this.node.remove();
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
    }

    protected override getEventObject(data: {
        eventType: PresentationEventType;
        newConfig: ComponentConfig<ImageConfig>;
        previousConfig?: ComponentConfig<ImageConfig>;
        trackHistory?: boolean;
    }): ImageEvent {
        const defaultEvent: ImageEvent = {
            nodeId: this.node._id.toString(),
            presentationId: this.slide.presentationId,
            slideId: this.slide.slideId,
            previousConfig: structuredClone(!data.previousConfig ? this.getSerializableConfig() : data.previousConfig),
            trackHistory: data.trackHistory == undefined ? true : data.trackHistory,
            currentConfig: {
                attrs: {
                    ...this.getSerializableConfig().attrs,
                    ...data.newConfig.attrs,
                },
                zIndex: data.newConfig.zIndex,
            },
        };

        switch (data.eventType) {
            case PresentationEventType.ADD:
                return new AddImageEvent({ ...defaultEvent });
            case PresentationEventType.UPDATE:
                return new UpdateImageEvent({ ...defaultEvent });
            case PresentationEventType.REMOVE:
                return new RemoveImageEvent({
                    ...defaultEvent,
                    currentConfig: { attrs: {}, zIndex: data.newConfig.zIndex },
                });
            case PresentationEventType.SELECT:
                return new SelectImageEvent({ ...defaultEvent });
            default:
                return new ImageEvent({ ...defaultEvent });
        }
    }

    private applyConfigurations(event: UpdateImageEvent) {
        const config = event.currentConfig;
        if (!config) {
            return;
        }
        const { imageSrc, ...attrs } = config.attrs;
        this.node.setAttrs(attrs as ImageConfig);
        if (imageSrc && imageSrc !== this.node.getAttr('imageSrc')) {
            const imageElement = new Image();
            imageElement.onload = () => {
                this.node.image(imageElement);
                this.node.setAttr('imageSrc', imageSrc);
                this.node.getLayer()?.batchDraw();
            };
            imageElement.src = imageSrc;
        }
        if (event?.zIndexActions != undefined) {
            switch (event.zIndexActions) {
                case ZIndexActions.moveToFront:
                    this.node.moveToTop();
                    break;
                case ZIndexActions.moveToBack:
                    this.node.moveToBottom();
                    break;
                case ZIndexActions.moveDown:
                    this.node.moveDown();
                    break;
                case ZIndexActions.moveUp:
                    this.node.moveUp();
                    break;
            }
            return;
        }
        this.node.zIndex(config.zIndex);
    }

    private getSerializableConfig(): ComponentConfig<SerializableImageConfig> {
        const attrs = { ...this.node.getAttrs() };
        delete attrs['image'];
        return {
            attrs,
            zIndex: this.node.getZIndex(),
        };
    }

    protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (
            event.key === 'Delete' &&
            this.slide.controller.isNodeSelected(this.node)
        ) {
            this.handleRemove();
        }
    };
}
