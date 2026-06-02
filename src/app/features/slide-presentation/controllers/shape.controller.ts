import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import {
  ComponentConfig,
  PresentationEventStream,
  PresentationEventType,
} from '../domain/EventModels/presentationEvents.model';
import {
  AddShapeEvent,
  RemoveShapeEvent,
  SelectShapeEvent,
  ShapeEvent,
  UpdateShapeEvent,
} from '../domain/EventModels/shapeEvent.models';
import { ShapeType } from '../domain/canvasModels/shapeComponent.model';
import { shapeNodeService } from '../../../services/konva.services/shapeNode.service';

export default class ShapeController extends BaseController {
  override node: Shape;
  slide: Slide;
  shapeType: ShapeType;
  constructor(init: {
    shape: Shape;
    slide: Slide;
    eventBus: PresentationEventStream;
    shapeType: ShapeType;
  }) {
    super({ node: init.shape, eventBus: init.eventBus });
    this.node = init.shape;
    this.slide = init.slide;
    this.registerEvents();
    this.listenPresentationEventStream();
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

  protected listenPresentationEventStream() {
    this.eventBus.subscribe((event) => {
      if (
        !(event instanceof ShapeEvent) ||
        event.nodeId != this.node._id.toString()
      ) {
        return;
      }
      if (event instanceof UpdateShapeEvent) {
        this.applyConfigurations(event);
        return;
      }
    });
  }

  protected override getEventObject(data: {
    eventType: PresentationEventType;
    newConfig: ComponentConfig<ShapeConfig>;
    previousConfig?: ComponentConfig<ShapeConfig>;
    trackHistory?: boolean;
  }): ShapeEvent {
    const defaultEvent: ShapeEvent = {
      presentationId: this.slide.presentationId,
      slideId: this.slide.slideId,
      trackHistory: data.trackHistory == undefined ? true : data.trackHistory,
      nodeId: this.node._id.toString(),
      shapeType: this.shapeType,
      currentConfig: {
        attrs: {
          ...structuredClone(this.node.getAttrs()),
          ...data.newConfig.attrs,
        },
        zIndex: data.newConfig.zIndex,
      },
      previousConfig: structuredClone(
        !data.previousConfig
          ? { attrs: this.node.getAttrs(), zIndex: this.node.zIndex() }
          : data.previousConfig,
      ),
    };

    switch (data.eventType) {
      case PresentationEventType.SELECT:
        return new SelectShapeEvent({
          ...defaultEvent,
        });
      case PresentationEventType.ADD:
        return new AddShapeEvent({ ...defaultEvent });
      case PresentationEventType.UPDATE:
        return new UpdateShapeEvent({ ...defaultEvent });
      case PresentationEventType.REMOVE:
        return new RemoveShapeEvent({ ...defaultEvent });
      default:
        return new ShapeEvent({
          ...defaultEvent,
        });
    }
  }

  protected applyConfigurations(event: UpdateShapeEvent) {
    const config = event.currentConfig;
    if (!config) {
      return;
    }
    shapeNodeService.updateShapeNode({
      node: this.node,
      zIndexActions: event.zIndexActions,
      config: config,
    });
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
