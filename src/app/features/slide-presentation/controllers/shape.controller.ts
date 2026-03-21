import { Shape } from "konva/lib/Shape";
import { Slide } from "../domain/canvasModels/slide.model";
import CanvasControllers from "./canvas.controller";

export default class ShapeController extends CanvasControllers {
    node!: Shape;
    slide!: Slide;
    constructor(init: {
        shape: Shape,
        slide: Slide
    }) {
        super();
        this.node = init.shape;
        this.slide = init.slide;
        this.registerEvents();
    }
    private destroy() {
        this.node.remove();
        this.slide.controller.removeSelectionOfComponent(this.node);
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
    }

    private registerEvents() {
        this.node.on('click', () => {
            this.slide.controller.selectComponent(this.node);
        });
        this.node.on("dblclick", () => {
            const { x, y } = this.node.getAbsolutePosition();
        });
        this.node.on("dragend", () => {
            console.log("Drag ended");
        });
        document.addEventListener('keydown', this.handleKeyboardStrokes);
        this.node.on('transformend', () => {
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
    private handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (event.key === 'Delete' && this.slide.controller.isNodeSelected(this.node)) {
            this.destroy();
        }
    }
}