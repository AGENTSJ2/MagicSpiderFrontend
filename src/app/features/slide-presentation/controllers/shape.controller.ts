import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import ShapeComponent, {
  ShapeType,
} from '../domain/canvasModels/shapeComponent.model';

export default class ShapeController extends BaseController {
  override node: Shape;
  override canvasComponent: ShapeComponent;
  shapeType: ShapeType;
  constructor(init: {
    shape: ShapeComponent;
    slide: Slide;
    eventBus: PresentationEventStream;
    shapeType: ShapeType;
  }) {
    super({ canvasComponent: init.shape, slide: init.slide });
    this.canvasComponent = init.shape;
    this.node = init.shape.node;
    this.slide = init.slide;
    this.registerEvents();
    this.shapeType = init.shapeType;
  }

  override destroy() {
    this.node.remove();
    this.slide.controller.removeSelectionOfComponent(this.node);
    document.removeEventListener('keydown', this.handleKeyboardStrokes);
  }

  protected registerEvents() {
    super.handleNodeClick();
    super.handleTransformEvents();
    super.handleDragEvents();
    document.addEventListener('keydown', this.handleKeyboardStrokes);
  }
  private updateShapeNode(params: {
    zIndexActions?: ZIndexActions;
    config: ComponentConfig<ShapeConfig>;
  }) {
    this.node.setAttrs(params.config.attrs);
    if(params.config.zIndex !== undefined) {
      this.node.zIndex(params.config.zIndex);
    }
    if (params?.zIndexActions != undefined) {
      switch (params.zIndexActions) {
        case ZIndexActions.moveToFront:
          this.node.moveToTop();
          break;
        case ZIndexActions.moveToBack:
          this.node.moveToBottom();
          break;
        case ZIndexActions.moveDown:
          this.node.moveDown();
          break;
        case ZIndexActions.moveUp:
          this.node.moveUp();
          break;
      }
    }
  }
  override applyConfigurations(event: {
    currentConfig: ComponentConfig<ShapeConfig>;
    zIndexActions?: ZIndexActions;
  }) :ShapeComponent{
    const config = event.currentConfig;
    this.updateShapeNode({
      zIndexActions: event.zIndexActions,
      config: config,
    });
    super.applyConfigurations(event);
    return this.canvasComponent;
  }

  protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
    if (
      event.key === 'Delete' &&
      this.slide.controller.isNodeSelected(this.node)
    ) {
      super.handleRemove();
    }
  };
}
