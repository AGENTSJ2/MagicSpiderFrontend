import { Shape } from "konva/lib/Shape";
import { Layer } from "konva/lib/Layer";
import { Rect } from "konva/lib/shapes/Rect";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Stage } from "konva/lib/Stage";
import { DocumentConfiguration } from "../domain/models/documentConfiguration.model";
import { ICanvasComponent } from "../domain/canvasModels/ICanvasComponent";
import { PresentationEvent, PresentationEventStream, PresentationEventType, ShapeEvent, SlideEvent } from "../domain/EventModels/presentationEvents.model";
import { TextComponent } from "../domain/canvasModels/textComponent.model";
import ShapeComponent from "../domain/canvasModels/shapeComponent.model";
import { Slide } from "../domain/canvasModels/slide.model";
import { Subscription } from "rxjs";
import { AddTextEvent, SelectTextEvent, TextEvent, UpdateTextEvent } from "../domain/EventModels/textEvent.model";
import { AddShapeEvent, SelectShapeEvent } from "../domain/EventModels/shapeEvent.models";

export default class SlideController {
    transformer!: Transformer;
    layer!: Layer;
    mainCover!: Rect;
    stage!: Stage;
    private slide: Slide;
    private eventBus: PresentationEventStream;
    private eventBusSubscription!: Subscription;
    private readonly Anchors = [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-center",
        "bottom-right"
    ];

    constructor(init: { eventBus: PresentationEventStream, slide: Slide }) {
        this.eventBus = init.eventBus;
        this.slide = init.slide;
        this.setUp();
        this.registerEvents();
        this.ListenPresentationEvents();
    }

    private setUp() {
        this.stage = new Stage({
            container: document.createElement('div'),
            width: 100,
            height: 100,
        });
        this.layer = new Layer();
        this.mainCover = new Rect({
            x: 0,
            y: 0,
            width: this.stage.width(),
            height: this.stage.height(),
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1,
        });
        this.transformer = new Transformer({
            rotateEnabled: true,
            enabledAnchors: [
                'top-left',
                'top-center',
                'top-right',
                'middle-left',
                'middle-right',
                'bottom-left',
                'bottom-center',
                'bottom-right',
            ],
            keepRatio: true,
            centeredScaling: false,
            rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
            rotateAnchorOffset: 60,
            borderStroke: '#4A90E2',
            borderStrokeWidth: 1,
            anchorStroke: '#4A90E2',
            anchorFill: 'white',
            anchorSize: 8,
            anchorCornerRadius: 2,
            padding: 5,
            flipEnabled: false,
        });
        this.stage.add(this.layer);
        this.layer.add(this.mainCover);
        this.layer.add(this.transformer);
    }

    private registerEvents() {
        this.stage.on('mousedown', (e) => {
            // if clicked on empty area
            if (e.target === this.mainCover) {
                this.transformer?.nodes([]); // clears selection
                this.layer?.batchDraw();
                return;
            }
        }
        );
    }

    private ListenPresentationEvents() {
        this.eventBusSubscription = this.eventBus.subscribe((event: PresentationEvent) => {
            if (event.slideId != this.slide.slideId) {
                return;
            }
            this.transformer.moveToTop(); // always move to top 
            let node: Shape | undefined;
            if(event instanceof TextEvent)
            {
                this.handleTextEvents(event);
            };
            if(event instanceof ShapeEvent)
            {
                this.handleShapeEvents(event);
            };
            if(event instanceof SlideEvent)
            {
                this.handleSlideEvents(event);
            };
        })
    }
    protected handleTextEvents(event:TextEvent)
    {
        if(event instanceof SelectTextEvent)
        {
            const nodeId = event.nodeId;
            let targetNode = this.slide.components.find((nd) => nd._id.toString() == nodeId);
            this.selectComponent(targetNode!);
            return;
        }
        if(event instanceof AddTextEvent)
        {
            this.handleAddNode(event);
            return;
        }
    }
    protected handleShapeEvents(event:ShapeEvent)
    {
        if(event instanceof SelectShapeEvent)
        {
            const nodeId = event.nodeId;
            let targetNode = this.slide.components.find((nd) => nd._id.toString() == nodeId);
            this.selectComponent(targetNode!);
            return;
        }
        if(event instanceof AddShapeEvent)
        {
            this.handleAddNode(event);
            return;
        }
    }
    protected handleSlideEvents(event:SlideEvent)
    {

    }


    triggerResize(options: { divElm: HTMLDivElement, config: DocumentConfiguration }) {
        this.slide.containerDiv = options.divElm;
        const containerWidth = options.divElm.offsetWidth;
        const containerHeight =
            options.divElm.offsetWidth *
            (options.config.ratio.den / options.config.ratio.num);
        this.stage.container(options.divElm);
        this.stage.height(containerHeight);
        this.stage.width(containerWidth);
        this.mainCover.height(containerHeight);
        this.mainCover.width(containerWidth);
        this.layer.batchDraw()
        this.stage.draw();
    }

    isNodeSelected(node: Shape): boolean {
        return this.transformer.nodes().some((nd) => nd == node);
    }

    selectComponent(node: Shape, options?: { anchors: string[] }) {
        this.transformer.nodes([node]);
        this.transformer.enabledAnchors(options?.anchors ?? this.Anchors);
        this.layer.batchDraw();
    }

    removeSelectionOfComponent(node: Shape) {
        let selected = this.transformer.nodes();
        selected = selected.filter((nd) => nd != node);
        this.transformer.nodes(selected);
        this.layer.batchDraw();
    }

    addComponent(node: ICanvasComponent) {
        this.layer.add(node.node);
        this.slide.components.push(node.node);
    }

    destroy() {
        this.eventBusSubscription.unsubscribe();
    }

    private handleAddNode(event: PresentationEvent) {
        let node: ICanvasComponent | undefined;
        if (event instanceof TextEvent) {
            node = new TextComponent({
                slide: this.slide,
                textContent: "New Text",
                eventBus: this.eventBus
            })
        }
        if (event instanceof ShapeEvent) {
            node = new ShapeComponent({
                slide: this.slide,
                shapeType: event.shapeType,
                eventBus: this.eventBus
            })
        }
        this.addComponent(node!);
        event.nodeId = node!.node!._id.toString();
        event.currentConfig = { attrs: node!.node!.getAttrs(), zIndex: node!.node!.getZIndex() };
        event.previousConfig = event.previousConfig;
    }
}