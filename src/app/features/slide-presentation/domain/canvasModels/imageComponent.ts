import { Image as KonvaImage, ImageConfig } from 'konva/lib/shapes/Image';
import ImageController from '../../controllers/image.controller';
import {
  ComponentConfig,
  PresentationEventStream,
  PresentationEventType,
  ZIndexActions,
} from '../EventModels/presentationEvents.model';
import { Slide } from './slide.model';
import { ICanvasComponent } from './ICanvasComponent';
export type SerializableImageConfig = Partial<ImageConfig> & {
  imageSrc?: string;
};
export class ImageComponent implements ICanvasComponent {
  node: KonvaImage;
  config: ComponentConfig<SerializableImageConfig>;
  slide: Slide;
  controller: ImageController;

  constructor(
    init: Partial<ImageComponent> & { eventBus: PresentationEventStream },
  ) {
    this.config = init.config!;
    this.slide = init.slide!;
    const attrs = this.config?.attrs ?? {};
    const imageElement = new Image();

    this.node = new KonvaImage({
      ...attrs,
      image: imageElement,
      x: attrs.x ?? 10,
      y: attrs.y ?? 10,
      width: attrs.width ?? 300,
      height: attrs.height ?? 180,
      draggable: true,
    });

    imageElement.onload = () => {
      if (!attrs.width || !attrs.height) {
        const maxWidth = 420;
        const scale = Math.min(1, maxWidth / imageElement.naturalWidth);
        this.node.width(imageElement.naturalWidth * scale);
        this.node.height(imageElement.naturalHeight * scale);
      }
      this.node.getLayer()?.batchDraw();
    };

    if (attrs.imageSrc) {
      imageElement.src = attrs.imageSrc;
    }

    this.controller = new ImageController({
      slide: this.slide,
      imageNode: this,
      eventBus: init.eventBus,
    });
  }

  private getSerializableConfig(): ComponentConfig<SerializableImageConfig> {
    const attrs = { ...this.node.getAttrs() };
    delete attrs['image'];
    return {
      attrs,
      zIndex: this.node.getZIndex(),
    };
  }

  destroy(): void {
    this.controller.destroy();
    this.node.destroy();
  }

  updateComponent(params: {
    newConfig: ComponentConfig<SerializableImageConfig>;
    previousConfig?: ComponentConfig<SerializableImageConfig>;
    trackHistory?: boolean;
    zIndexActions?: ZIndexActions;
  }): ImageComponent {
    const zIndex = this.node.zIndex();
    const oldConfig: ComponentConfig<ImageConfig> = {
      attrs: this.node.toObject().attrs,
      zIndex: zIndex,
    };
    const updatedComp = this.controller.applyConfigurations({
      currentConfig: params.newConfig,
      zIndexActions: params.zIndexActions,
    });
    const newConfig: ComponentConfig<ImageConfig> = {
      attrs: this.node.toObject().attrs,
      zIndex: zIndex,
    };
    this.slide.presentation.emitEvent({
      slide: this.slide,
      component: this,
      eventType: PresentationEventType.UPDATE,
      oldConfig: oldConfig,
      newConfig: newConfig,
    });
    return updatedComp;
  }
}
