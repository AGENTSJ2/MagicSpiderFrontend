import Konva from "konva";
import { Slide } from "../models/slide.model";

export default class TextController {
    private textareaToEditText: HTMLTextAreaElement | undefined;
    private readonly positionSlack = 5;
    private slide!: Slide;
    private containerDiv!: HTMLDivElement;
    private boundRespondToClick!: (event: MouseEvent) => void;
    text!: Konva.Text;

    constructor(init: {
        slide: Slide,
        containerDiv: HTMLDivElement,
        content: string
    }) {
        this.slide = init.slide;
        this.containerDiv = init.containerDiv;
        this.text = new Konva.Text({
            x: 10,
            y: 10,
            text: init.content,
            fontSize: 50,
            draggable: true,
        });
        this.registerEvents();
        this.slide.layer.add(this.text);
        this.boundRespondToClick = this.respondToClick.bind(this);
    }
    private respondToClick(event: MouseEvent) {
        if (this.textareaToEditText && event.target != this.textareaToEditText) {
            this.text.text(this.textareaToEditText.value);
            this.textareaToEditText.remove();
            document.removeEventListener('mousedown', this.boundRespondToClick);
        }
    }
    registerEvents() {
        this.text.on('click', () => {
            this.slide.transformer.nodes([this.text]);
            this.slide.transformer.enabledAnchors([]);
            this.slide.layer.batchDraw();
        });
        this.text.on("dblclick", () => {
            const { x, y } = this.text.getAbsolutePosition();
            // creating textarea
            this.textareaToEditText = document.createElement("textarea");
            this.textareaToEditText.value = this.text.text();
            this.textareaToEditText.style.position = "absolute";
            this.textareaToEditText.style.left = x + "px";
            this.textareaToEditText.style.top = (y - this.positionSlack) + "px";
            this.textareaToEditText.style.width = 'auto';
            this.textareaToEditText.style.height = 'auto';
            this.textareaToEditText.style.fontSize = this.text.fontSize() + "px";
            this.textareaToEditText.style.fontFamily = this.text.fontFamily();
            this.containerDiv.appendChild(this.textareaToEditText);
            this.textareaToEditText.focus();
            // click event seems to run as it was set inside dblClick hence mousedown is used 
            document.addEventListener('mousedown', this.boundRespondToClick);
        });
        this.text.on("dragend", () => {
            console.log("Drag ended");
        });
    }
}