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
    // ✅ Proper config object
    const config = {
      ...(this.config?.attrs ? this.config.attrs : {}),
      x: init.config?.attrs.x ?? 10,
      y: init.config?.attrs.y ?? 10,
      width: init.config?.attrs.width ?? 100,
      height: init.config?.attrs.height ?? 100,
      fill: init.config?.attrs.fill ?? 'white',
      stroke: init.config?.attrs.stroke ?? 'black',
      strokeWidth: init.config?.attrs.strokeWidth ?? 1,
      draggable: true,
    };

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
    const oldConfig: ComponentConfig<ShapeConfig> = {
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
    if(params.trackHistory == undefined || params.trackHistory)
    {
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
