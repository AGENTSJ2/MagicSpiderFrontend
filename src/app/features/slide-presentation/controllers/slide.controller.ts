import { Shape } from "konva/lib/Shape";
import { Layer } from "konva/lib/Layer";
import { Rect } from "konva/lib/shapes/Rect";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Stage } from "konva/lib/Stage";
import { DocumentConfiguration } from "../domain/models/documentConfiguration.model";
import { ICanvasComponent } from "../domain/canvasModels/ICanvasComponent";

export default class SlideController {
    transformer!: Transformer;
    layer!: Layer;
    mainCover!: Rect;
    stage!: Stage;

    constructor() {
        this.setUp();
        this.registerEvents();
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
    triggerResize(options: { divElm: HTMLDivElement, config: DocumentConfiguration }) {
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
    isNodeSelected(node:Shape):boolean
    {
        return this.transformer.nodes().some((nd)=>nd==node);
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
    }
}