import { Shape, ShapeConfig } from "konva/lib/Shape";
import { ComponentConfig, PresentationEvent, ZIndexActions } from "../EventModels/presentationEvents.model";
import BaseController from "../../controllers/base.controller";

export interface ICanvasComponent
{
    node:Shape;
    readonly controller: BaseController;
    
    destroy():void;
    updateComponent(params:{
        newConfig:ComponentConfig<ShapeConfig>,
        previousConfig?:ComponentConfig<ShapeConfig>,
        trackHistory?:boolean,
        zIndexActions?:ZIndexActions,
    }):ICanvasComponent;
}