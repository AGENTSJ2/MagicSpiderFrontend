import Konva from "konva";

export interface ICanvasComponent
{
    node:Konva.Shape;
    destroy():void;
}