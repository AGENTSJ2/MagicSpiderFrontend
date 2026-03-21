import { Shape } from "konva/lib/Shape";
import { Slide } from "../domain/canvasModels/slide.model";

export default class ShapeController
{
    node!:Shape;
    slide!:Slide;
    constructor(init:{
        shape:Shape,
        slide:Slide
    })
    {
        this.node = init.shape;
        this.slide = init.slide;
        this.registerEvents();
    }
    registerEvents() {
        this.node.on('click', () => {
            this.slide.controller.selectComponent(this.node);
        });
        this.node.on("dblclick", () => {
            const { x, y } = this.node.getAbsolutePosition();
        });
        this.node.on("dragend", () => {
            console.log("Drag ended");
        });
    }
}