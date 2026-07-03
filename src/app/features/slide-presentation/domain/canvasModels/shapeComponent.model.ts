import { Shape, ShapeConfig } from 'konva/lib/Shape';
import { ICanvasComponent } from './ICanvasComponent';
import { Circle } from 'konva/lib/shapes/Circle';
import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import ShapeController from '../../controllers/shape.controller';
import { Slide } from './slide.model';
import {
  ComponentConfig,
  PresentationEventStream,
  PresentationEventType,
  ZIndexActions,
} from '../EventModels/presentationEvents.model';
export default class ShapeComponent implements ICanvasComponent {
  shapeType: ShapeType;
  config: ComponentConfig<ShapeConfig>;
  node: Shape;
  readonly controller!: ShapeController;
  slide: Slide;

  constructor(
    init: Partial<ShapeComponent> & { eventBus: PresentationEventStream },
  ) {
    this.slide = init.slide!;
    this.shapeType = init.shapeType!;
    this.node = init.node!;
    this.config = init.config!;
    const attrs = this.config?.attrs ?? {};
    const hasGradientFill = attrs.fillLinearGradientColorStops != null;
    const isRadiusSized = (attrs as any).radius != null;

    const config: ShapeConfig = {
      ...attrs,
      x: attrs.x ?? 0,
      y: attrs.y ?? 0,
      stroke: attrs.stroke ?? 'black',
      strokeWidth: attrs.strokeWidth ?? 1,
      draggable: true,
    };
    if (!isRadiusSized) {
      config.width = attrs.width ?? 100;
      config.height = attrs.height ?? 100;
    }
    if (!hasGradientFill) {
      config.fill = attrs.fill ?? 'white';
    }

    switch (init.shapeType) {
      case ShapeType.CIRCLE:
        this.node = new Circle(config);
        break;
      case ShapeType.LINE:
        this.node = new Line(config);
        break;
      case ShapeType.RECT:
        this.node = new Rect(config);
        break;
      default:
        break;
    }
    this.controller = new ShapeController({
      shape: this,
      slide: this.slide,
      eventBus: init.eventBus,
      shapeType: init.shapeType!,
    });
  }

  destroy(): void {
    this.controller.destroy();
    this.node.destroy();
  }
  updateComponent(params: {
    newConfig: ComponentConfig<ShapeConfig>;
    previousConfig?: ComponentConfig<ShapeConfig>;
    trackHistory?: boolean;
    zIndexActions?: ZIndexActions;
  }): ShapeComponent {
    const zIndex = this.node.zIndex();
    const oldConfig: ComponentConfig<ShapeConfig> = params.previousConfig
      ? structuredClone(params.previousConfig)
      : {
          attrs: this.node.toObject().attrs,
          zIndex: zIndex,
        };
    const updatedComp = this.controller.applyConfigurations({
      currentConfig: params.newConfig,
      zIndexActions: params.zIndexActions,
    });
    const newConfig: ComponentConfig<ShapeConfig> = {
      attrs: this.node.toObject().attrs,
      zIndex: zIndex,
    };
    if (params.trackHistory == undefined || params.trackHistory) {
      this.slide.presentation.emitEvent({
        slide: this.slide,
        component: this,
        eventType: PresentationEventType.UPDATE,
        oldConfig: oldConfig,
        newConfig: newConfig,
      });
    }
    return updatedComp;
  }
}
export enum ShapeType {
  LINE,
  CIRCLE,
  RECT,
}
