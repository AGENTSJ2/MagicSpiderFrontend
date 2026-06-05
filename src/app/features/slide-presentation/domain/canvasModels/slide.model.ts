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

export class Slide {
  slideId: string;
  presentationId: string;
  components: ICanvasComponent[];
  readonly controller: SlideController;
  containerDiv!: HTMLDivElement;
  private eventBus: PresentationEventStream;
  constructor(init: Partial<Slide> & { eventBus: PresentationEventStream }) {
    this.slideId = init.slideId!;
    this.presentationId = init.presentationId!;
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
    return component;
  }

  addImage(params: { config: ComponentConfig<SerializableImageConfig> }) {
    const component = new ImageComponent({
      slide: this,
      config: params.config,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    return component;
  }

  removeComponent(node: ICanvasComponent) {
    const index = this.components.findIndex(
      (x) => x.node._id.toString() === node.node._id.toString(),
    );
    if (index == -1) {
      return;
    }
    const removed = this.components.splice(index, 1)[0];
    removed.node.remove();
    this.controller.removeSelectionOfComponent(removed.node);
  }

  selectComponent(node: Shape, options?: { anchors: string[] }) {
    this.controller.selectComponent(node, options);
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
