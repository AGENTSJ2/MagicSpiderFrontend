import { Shape, ShapeConfig } from "konva/lib/Shape";
import { ComponentConfig, PresentationEvent, ZIndexActions } from "../EventModels/presentationEvents.model";
import BaseController from "../../controllers/base.controller";
import { Slide } from "./slide.model";

export interface ICanvasComponent
{
    node:Shape;
    slide:Slide;
    readonly controller: BaseController;
    
    destroy():void;
    updateComponent(params:{
        newConfig:ComponentConfig<ShapeConfig>,
        previousConfig?:ComponentConfig<ShapeConfig>,
        trackHistory?:boolean,
        zIndexActions?:ZIndexActions,
    }):ICanvasComponent;
}