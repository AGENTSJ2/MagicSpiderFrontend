import Konva from "konva";
import { Slide } from "../domain/canvasModels/slide.model";
import CanvasControllers from "./canvas.controller";

export default class TextController extends CanvasControllers {
    private textareaToEditText: HTMLTextAreaElement | undefined;
    private readonly positionSlack = 5;
    private slide: Slide;
    private containerDiv: HTMLDivElement;
    node: Konva.Text;

    constructor(init: {
        slide: Slide,
        content: string,
        textNode: Konva.Text
    }) {
        super();
        this.slide = init.slide;
        this.containerDiv = init.slide.containerDiv;
        this.node = init.textNode;
        this.registerEvents();
    }

    private destroy() {
        this.node.remove();
        this.slide.controller.removeSelectionOfComponent(this.node);
        document.removeEventListener('keydown', this.handleKeyboardStrokes);
    }

    private boundRespondToClick = (event: MouseEvent) => {
        if (this.textareaToEditText && event.target != this.textareaToEditText) {
            this.node.text(this.textareaToEditText.value);
            this.textareaToEditText.remove();
            document.removeEventListener('mousedown', this.boundRespondToClick);
        }
    }

    private handleKeyboardStrokes = (event: KeyboardEvent) => {
        if (event.key === 'Delete' && this.slide.controller.isNodeSelected(this.node)) {
            this.destroy();
        }
    }

    registerEvents() {
        this.node.on('click', () => {
            this.slide.controller.selectComponent(this.node, {
                anchors: ["middle-left","middle-right",]
            });
        });
        this.node.on("transform", () => {
            const scaleX = this.node.scaleX();

            // Convert scale → width/height
            this.node.width(this.node.width() * scaleX);

            // Reset scale (IMPORTANT)
            this.node.scaleX(1);
            this.node.scaleY(1);
        });
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
        this.node.on("dragend", () => {
            console.log("Drag ended");
        });
        document.addEventListener('keydown', this.handleKeyboardStrokes);

    }


}