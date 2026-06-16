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

  addText(params: {
    config?: ComponentConfig<TextConfig>;
    trackHistory?: boolean;
  }) {
    const component = new TextComponent({
      slide: this,
      config: params?.config,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    if (params.trackHistory == undefined || params!.trackHistory) {
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
    }
    return component;
  }

  addShape(params: {
    config?: ComponentConfig<ShapeConfig>;
    shapeType: ShapeType;
    trackHistory?: boolean;
  }) {
    const component = new ShapeComponent({
      slide: this,
      config: params.config,
      shapeType: params.shapeType,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    if (params.trackHistory == undefined || params.trackHistory) {
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
    }
    return component;
  }

  addImage(params: {
    config?: ComponentConfig<SerializableImageConfig>;
    trackHistory?: boolean;
  }) {
    const component = new ImageComponent({
      slide: this,
      config: params.config,
      eventBus: this.eventBus,
    });
    this.controller.addComponent(component);
    if (params.trackHistory == undefined || params.trackHistory) {
      this.presentation.emitEvent({
        slide: this,
        component: component,
        eventType: PresentationEventType.ADD,
        oldConfig: undefined,
        newConfig: component.getSerializableConfig(),
      });
    }
    return component;
  }

  removeComponent(node: ICanvasComponent, trackHistory: boolean = true) {
    const index = this.components.findIndex(
      (x) => x.node._id.toString() === node.node._id.toString(),
    );
    if (index == -1) {
      return;
    }
    const removed = this.components.splice(index, 1)[0];
    removed.node.remove();
    this.controller.removeSelectionOfComponent(removed.node);
    this.presentation.controller.addToTrash(removed);
    if (trackHistory == undefined || trackHistory) {
      this.presentation.emitEvent({
        slide: this,
        component: removed,
        eventType: PresentationEventType.REMOVE,
        oldConfig: { attrs: removed.node.attrs, zIndex: removed.node.zIndex() },
        newConfig: undefined,
      });
    }
  }

  restoreComponent(nodeId: string) {
    const compToRestore = this.presentation.controller.takeFromTrash(nodeId);
    if (!compToRestore) {
      throw new Error('No node found to restore');
    }
    this.controller.addComponent(compToRestore);
  }

  selectComponent(
    canvasComponent: ICanvasComponent,
    options?: { anchors: string[] },
  ) {
    this.controller.selectComponent(canvasComponent, options);
  }

  destroy() {
    this.controller.destroy();
  }

  getLatestSlideImage() {
    const img = this.controller.getStageSnapShot();
    return img;
  }
  
  toJson() {
    const parentLayerOfSlide = this.components.at(0)?.node.parent;
    const children = parentLayerOfSlide?.children ?? [];
    const componentsInOrder:ICanvasComponent [] = [];
    for(let child of children)
    {
      const component = this.components.find((comp)=>comp.node._id == child._id);
      if(component)
      {
        componentsInOrder.push(component);
      }
    }
    const json = {
      slideId: this.slideId,
      presentationId: this.presentationId,
      components: componentsInOrder.map((cm) => {
        cm.node.id(cm.node._id.toString());
        const componentNode: any = cm.node.toObject();
        componentNode.attrs.zIndex = cm.node.zIndex();
        if (cm.node.className == 'Image') {
          const imageId = (cm as ImageComponent).getSerializableConfig().attrs
            .imageId;
          componentNode.attrs.imageId = imageId;
        }
        return {
          node: componentNode,
        };
      }),
    };
    return json;
  }
}
