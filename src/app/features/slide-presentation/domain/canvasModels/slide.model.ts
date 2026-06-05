import SlideController from '../../controllers/slide.controller';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  PresentationEventType,
} from '../EventModels/presentationEvents.model';
import { ICanvasComponent } from './ICanvasComponent';
import { TextConfig } from 'konva/lib/shapes/Text';
import { TextComponent } from './textComponent.model';
import ShapeComponent, { ShapeType } from './shapeComponent.model';
import { ImageComponent, SerializableImageConfig } from './imageComponent';
import type { Presentation } from './presenatation.model';

export class Slide {
  readonly slideId: string;
  readonly presentationId: string;
  readonly presentation: Presentation;
  components: ICanvasComponent[];
  readonly controller: SlideController;
  containerDiv!: HTMLDivElement;
  private eventBus: PresentationEventStream;
  constructor(init: {
    presentation: Presentation;
    slideId?: string;
    components?: ICanvasComponent[];
    eventBus: PresentationEventStream;
  }) {
    this.presentation = init.presentation;
    this.slideId = init.slideId ?? crypto.randomUUID().toString();
    this.presentationId = init.presentation.id;
    this.components = init.components ?? [];
    this.eventBus = init.eventBus;
    this.controller = new SlideController({
      eventBus: init.eventBus,
      slide: this,
    });
  }

  addText(params?: { config?: ComponentConfig<TextConfig> }) {
    const component = new TextComponent({
      slide: this,
      config: params?.config,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    this.presentation.emitEvent({
      slide: this,
      component: component,
      eventType: PresentationEventType.ADD,
      oldConfig: undefined,
      newConfig: {
        attrs: component.node.attrs,
        zIndex: component.node.zIndex(),
      },
    });
    return component;
  }

  addShape(params: {
    config?: ComponentConfig<ShapeConfig>;
    shapeType: ShapeType;
  }) {
    const component = new ShapeComponent({
      slide: this,
      config: params.config,
      shapeType: params.shapeType,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    this.presentation.emitEvent({
      slide: this,
      component: component,
      eventType: PresentationEventType.ADD,
      oldConfig: undefined,
      newConfig: {
        attrs: component.node.attrs,
        zIndex: component.node.zIndex(),
      },
    });
    return component;
  }

  addImage(params: { config: ComponentConfig<SerializableImageConfig> }) {
    const component = new ImageComponent({
      slide: this,
      config: params.config,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    
    this.presentation.emitEvent({
      slide: this,
      component: component,
      eventType: PresentationEventType.ADD,
      oldConfig: undefined,
      newConfig: {
        attrs: component.node.attrs,
        zIndex: component.node.zIndex(),
      },
    });
    return component;
  }

  removeComponent(node: ICanvasComponent,trackHistory:boolean = true) {
    const index = this.components.findIndex(
      (x) => x.node._id.toString() === node.node._id.toString(),
    );
    if (index == -1) {
      return;
    }
    const removed = this.components.splice(index, 1)[0];
    removed.node.remove();
    this.controller.removeSelectionOfComponent(removed.node);
    if(trackHistory == undefined || trackHistory)
    {
      this.presentation.emitEvent({
        slide: this,
        component: removed,
        eventType: PresentationEventType.REMOVE,
        oldConfig: { attrs: removed.node.attrs, zIndex: removed.node.zIndex() },
        newConfig: undefined,
      });
    }
  }

  selectComponent(
    canvasComponent: ICanvasComponent,
    options?: { anchors: string[] },
  ) {
    this.controller.selectComponent(canvasComponent.node, options);
  }

  destroy() {
    this.controller.destroy();
  }

  toJson() {
    const json = {
      slideId: this.slideId,
      presentationId: this.presentationId,
      components: this.components.map((cm) => {
        cm.node.id(cm.node._id.toString());
        return {
          node: JSON.parse(cm.node.toJSON()),
        };
      }),
    };
    return json;
  }
}
