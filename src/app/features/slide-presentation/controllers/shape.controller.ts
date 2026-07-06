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
import { shapeNodeService } from '../../../services/konva.services/shapeNode.service';

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

  override applyConfigurations(event: {
    currentConfig: ComponentConfig<ShapeConfig>;
    zIndexActions?: ZIndexActions;
  }) :ShapeComponent{
    const config = event.currentConfig;
    shapeNodeService.updateShapeNode({
      node: this.node,
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
