import { Shape } from "konva/lib/Shape";

export interface ICanvasComponent
{
    node:Shape;
    destroy():void;
}