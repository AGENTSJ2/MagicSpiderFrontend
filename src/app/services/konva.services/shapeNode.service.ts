import { Injectable } from '@angular/core';
import ShapeComponent, {
  ShapeType,
} from '../../features/slide-presentation/domain/canvasModels/shapeComponent.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import {
  ComponentConfig,
  PresentationEventStream,
  ZIndexActions,
} from '../../features/slide-presentation/domain/EventModels/presentationEvents.model';
import { Shape, ShapeConfig } from 'konva/lib/Shape';

@Injectable({
  providedIn: 'root',
})
export class ShapeNodeService {
  addShapeNode(params: {
    eventBus: PresentationEventStream;
    slide: Slide;
    config: ComponentConfig<ShapeConfig>;
    shapeType: ShapeType;
  }) {
    const component = new ShapeComponent({
      slide: params.slide,
      config: params.config,
      shapeType: params.shapeType,
      eventBus: params.eventBus,
    });
    params.slide.controller.addComponent(component);
    return component;
  }

  updateShapeNode(params: {
    node: Shape;
    zIndexActions?: ZIndexActions;
    config: ComponentConfig<ShapeConfig>;
  }):Shape | undefined {
    params.node.setAttrs(params.config.attrs);
    if(params.config.zIndex !== undefined) {
      params.node.zIndex(params.config.zIndex);
    }
    if (params?.zIndexActions != undefined) {
      switch (params.zIndexActions) {
        case ZIndexActions.moveToFront:
          params.node.moveToTop();
          break;
        case ZIndexActions.moveToBack:
          params.node.moveToBottom();
          break;
        case ZIndexActions.moveDown:
          params.node.moveDown();
          break;
        case ZIndexActions.moveUp:
          params.node.moveUp();
          break;
      }
    }
    return params.node;
  }
}

export const shapeNodeService = new ShapeNodeService();
