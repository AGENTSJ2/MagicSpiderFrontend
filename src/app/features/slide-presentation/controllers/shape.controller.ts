import { Shape } from "konva/lib/Shape";
import { Slide } from "../domain/canvasModels/slide.model";
import BaseController from "./base.controller";
import { PresentationEventStream } from "../domain/EventModels/presentationEvents.model";

export default class ShapeController extends BaseController {
    override node: Shape;
    slide!: Slide;
    constructor(init: {
        shape: Shape,
        slide: Slide,
        eventBus: PresentationEventStream
    }) {
        super({ node: init.shape });
        this.node = init.shape;
        this.slide = init.slide;
        this.registerEvents();
    }

    private destroy() {
        this.node.remove();
        this.slide.controller.removeSelectionOfComponent(this.node);
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
    }

    protected registerEvents() {
        this.handleNodeClick();
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
    protected handleNodeClick(): void {
        this.node.on('click', () => {
            this.slide.controller.selectComponent(this.node);
        });
    }

    private handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (event.key === 'Delete' && this.slide.controller.isNodeSelected(this.node)) {
            this.destroy();
        }
    }
}