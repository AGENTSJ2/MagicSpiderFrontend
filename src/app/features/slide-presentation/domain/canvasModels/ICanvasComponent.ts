import { Shape, ShapeConfig } from "konva/lib/Shape";
import { ComponentConfig, ZIndexActions } from "../EventModels/presentationEvents.model";

export interface ICanvasComponent
{
    node:Shape;

    destroy():void;
    updateComponent(params:{
        newConfig:ComponentConfig<ShapeConfig>,
        previousConfig?:ComponentConfig<ShapeConfig>,
        trackHistory?:boolean,
        zIndexActions?:ZIndexActions,
    }):ICanvasComponent;
}