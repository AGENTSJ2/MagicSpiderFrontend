import { Shape, ShapeConfig } from "konva/lib/Shape";
import { ICanvasComponent } from "./ICanvasComponent";
import { Circle } from "konva/lib/shapes/Circle";
import { Line } from "konva/lib/shapes/Line";
import { Rect } from "konva/lib/shapes/Rect";
import ShapeController from "../../controllers/shape.controller";
import { Slide } from "./slide.model";
import { PresentationEventStream } from "../EventModels/presentationEvents.model";

export default class ShapeComponent implements ICanvasComponent {
    x!: number;
    y!: number;
    width!: number;
    height!: number;
    fill!: string;
    stroke!: string;
    strokeWidth!: number;
    shapeType!: ShapeType;

    node!: Shape;
    controller!: ShapeController;
    slide!: Slide;

    constructor(init: Partial<ShapeComponent> & {eventBus:PresentationEventStream}) {
        this.slide = init.slide!;
        this.shapeType = init.shapeType!;
        this.x = init.x ?? 10;
        this.y = init.y ?? 10;
        this.width = init.width ?? 100;
        this.height = init.height ?? 100;
        this.fill = init.fill ?? "white";
        this.stroke = init.stroke ?? "black";
        this.strokeWidth = init.strokeWidth ?? 1;

        // ✅ Proper config object
        const config = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            fill: this.fill,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth,
            draggable: true
        };

        switch (init.shapeType) {
            case ShapeType.CIRCLE:
                this.node = new Circle(config);
                break;
            case ShapeType.LINE:
                this.node = new Line(config);
                break;
            case ShapeType.RECT:
                this.node = new Rect(config);
                break;
            default:
                break;
        }

        this.controller = new ShapeController(
            {
                shape: this.node,
                slide: this.slide,
                eventBus:init.eventBus ,
                shapeType:init.shapeType!
            }
        );
    }
}
export enum ShapeType {
    LINE,
    CIRCLE,
    RECT,
}