import Konva from "konva";
import { Slide } from "../domain/canvasModels/slide.model";
import BaseController from "./base.controller";
import { ComponentConfig, PresentationEventStream, PresentationEventType, TextEvent } from "../domain/EventModels/presentationEvents.model";
import { Subscription } from "rxjs";
import { TextConfig } from "konva/lib/shapes/Text";
import { ShapeConfig } from "konva/lib/Shape";

export default class TextController extends BaseController {
    private textareaToEditText: HTMLTextAreaElement | undefined;
    private readonly positionSlack = 5;
    private slide: Slide;
    private containerDiv: HTMLDivElement;
    private eventBus: PresentationEventStream;
    private eventSubscription!: Subscription;
    override node: Konva.Text;

    constructor(init: {
        slide: Slide,
        content: string,
        textNode: Konva.Text,
        eventBus: PresentationEventStream
    }) {
        super({ node: init.textNode });
        this.eventBus = init.eventBus;
        this.slide = init.slide;
        this.containerDiv = init.slide.containerDiv;
        this.node = init.textNode;
        this.registerEvents();
        this.listenPresentationEventStream();
    }

    protected registerEvents() {

        this.handleNodeClick();
        this.handleTransformEvents();
        this.handleDragEvents();

        this.node.on("dblclick", () => {
            this.slide.controller.removeSelectionOfComponent(this.node);
            const { x, y } = this.node.getAbsolutePosition();
            // creating textarea
            this.textareaToEditText = document.createElement("textarea");
            this.textareaToEditText.value = this.node.text();
            this.textareaToEditText.style.position = "absolute";
            this.textareaToEditText.style.left = x + "px";
            this.textareaToEditText.style.top = (y - this.positionSlack) + "px";
            this.textareaToEditText.style.width = 'auto';
            this.textareaToEditText.style.height = 'auto';
            this.textareaToEditText.style.fontSize = this.node.fontSize() + "px";
            this.textareaToEditText.style.fontFamily = this.node.fontFamily();
            this.containerDiv.appendChild(this.textareaToEditText);
            this.textareaToEditText.focus();
            // click event seems to run as it was set inside dblClick hence mousedown is used 
            document.addEventListener('mousedown', this.boundRespondToClick);
        });


        document.addEventListener('keydown', this.handleKeyboardStrokes);

    }

    private listenPresentationEventStream() {
        this.eventSubscription = this.eventBus.subscribe((event) => {
            if (!(event instanceof TextEvent) || event.nodeId != this.node._id.toString()) {
                return;
            }
            switch (event.eventType) {
                case PresentationEventType.UPDATE_TEXT:
                    const textEvent = event as TextEvent
                    this.applyConfigurations(textEvent.currentConfig);
                    break;
            }
        });
    }
    private applyConfigurations(config?: ComponentConfig<TextConfig>) {
        if (!config) { // config null means deletion of node (designed to perform undo operations on create operation)
            this.destroy();
            return;
        }
        this.node.setAttrs(
            config
        )
        this.node.zIndex(config.zIndex)
    }

    private destroy() {
        this.node.remove();
        this.slide.controller.removeSelectionOfComponent(this.node);
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
        this.eventSubscription.unsubscribe();
    }

    private getEventObject(data: { eventType: PresentationEventType, newConfig: ComponentConfig<TextConfig>, previousConfig?: ComponentConfig<TextConfig>, trackHistory?: boolean }): TextEvent {
        const currentAttrs = this.node.getAttrs();
        const prevConfig = data.previousConfig ? structuredClone(data.previousConfig) : {
            attrs: structuredClone(currentAttrs),
            zIndex: this.node.getZIndex(),
        };
        const event = new TextEvent(
            {
                nodeId: this.node._id.toString(),
                presentationId: this.slide.presentationId,
                slideId: this.slide.slideId,
                previousConfig: prevConfig,
                currentConfig: {
                    attrs: {
                        ...currentAttrs,
                        ...data.newConfig.attrs
                    },
                    zIndex: data.newConfig.zIndex
                },
                eventType: data.eventType,
                trackHistory: data.trackHistory == undefined ? true : data.trackHistory
            }
        );
        return event;
    }

    private boundRespondToClick = (event: MouseEvent) => {
        if (this.textareaToEditText && event.target != this.textareaToEditText) {
            const updatedConfig = {
                attrs: {
                    text: this.textareaToEditText.value,
                },
                zIndex: this.node.getZIndex(),
            };
            this.eventBus.next(
                this.getEventObject({ eventType: PresentationEventType.UPDATE_TEXT, newConfig: updatedConfig })
            );
            this.textareaToEditText.remove();
            document.removeEventListener('mousedown', this.boundRespondToClick);
        }
    }

    protected handleNodeClick(): void {
        this.node.on('click', () => {
            this.eventBus.next(
                this.getEventObject(
                    {
                        eventType: PresentationEventType.SELECT_NODE,
                        newConfig: { attrs: {}, zIndex: this.node.zIndex() },
                    }
                )
            )
        });
    }

    protected handleTransformEvents() {
        let widthBeforeTransform: number = this.node.width();
        let heightBeforeTransform: number = this.node.height();

        this.node.on("transformstart", () => {
            widthBeforeTransform = this.node.width();
            heightBeforeTransform = this.node.height();
        });

        this.node.on("transform", () => {
            const scaleX = this.node.scaleX();
            const scaleY = this.node.scaleY();
            const newWidth = this.node.width() * scaleX;
            const newHeight = this.node.height() * scaleY;
            const updatedConfig: ComponentConfig<ShapeConfig> = {
                attrs: {
                    width: newWidth,
                    height: newHeight,
                    scaleX: 1,
                    scaleY: 1,
                },
                zIndex: this.node.getZIndex()
            };
            this.eventBus.next(
                this.getEventObject({
                    eventType: PresentationEventType.UPDATE_TEXT,
                    newConfig: updatedConfig,
                    trackHistory: false
                })
            )
        });

        this.node.on("transformend", () => {
            const updatedConfig: ComponentConfig<TextConfig> = {
                attrs: {
                    width: this.node.width(),
                    height: this.node.height(),
                    scaleX: 1,
                    scaleY: 1,
                },
                zIndex: this.node.getZIndex()
            };
            const prevConfig: ComponentConfig<TextConfig> = {
                attrs: {
                    width: widthBeforeTransform,
                    height: heightBeforeTransform,
                    scaleX: 1,
                    scaleY: 1,
                },
                zIndex: this.node.getZIndex()
            }
            this.eventBus.next(
                this.getEventObject({
                    eventType: PresentationEventType.UPDATE_TEXT,
                    newConfig: updatedConfig,
                    previousConfig: prevConfig
                })
            )
        });
    }

    protected handleDragEvents() {
        let XBeforeDrag: number = this.node.x();
        let YBeforeDrag: number = this.node.y();
        this.node.on("dragstart", () => {
            XBeforeDrag = this.node.x();
            YBeforeDrag = this.node.y();
        });
        this.node.on("dragend", () => {
            this.eventBus.next(
                this.getEventObject({
                    eventType: PresentationEventType.UPDATE_TEXT,
                    newConfig: {
                        attrs: {}, // doesn't require manual setting of x and y since the drag operation sets the x and y directly
                        zIndex: this.node.zIndex()
                    },
                    previousConfig: {
                        attrs: {
                            x: XBeforeDrag,
                            y: YBeforeDrag
                        },
                        zIndex: this.node.zIndex()
                    }
                })
            );
            XBeforeDrag = this.node.x();
            YBeforeDrag = this.node.y();
        });
    }

    private handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (event.key === 'Delete' && this.slide.controller.isNodeSelected(this.node)) {
            this.destroy();
        }
    }
}