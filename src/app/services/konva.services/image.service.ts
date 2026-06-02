import { Injectable } from '@angular/core';
import { ImageComponent } from '../../features/slide-presentation/domain/canvasModels/imageComponent';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import {
  ComponentConfig,
  PresentationEventStream,
  ZIndexActions,
} from '../../features/slide-presentation/domain/EventModels/presentationEvents.model';
import { Image as KonvaImage, ImageConfig } from 'konva/lib/shapes/Image';
import { SerializableImageConfig } from '../../features/slide-presentation/domain/EventModels/imageEvent.model';

@Injectable({
  providedIn: 'root',
})
export class ImageNodeService {
  addImageNode(params: {
    eventBus: PresentationEventStream;
    slide: Slide;
    config: ComponentConfig<SerializableImageConfig>;
  }) {
    const component = new ImageComponent({
      slide: params.slide,
      config: params.config,
      eventBus: params.eventBus,
    });
    params.slide.controller.addComponent(component);
    return component;
  }

  updateImageNode(params: {
    currentConfig: ComponentConfig<SerializableImageConfig>;
    node: KonvaImage;
    zIndexActions?: ZIndexActions;
  }): KonvaImage | undefined {
    const config = params.currentConfig;
    if (!config) {
      return;
    }
    const { imageSrc, ...attrs } = config.attrs;
    params.node.setAttrs(attrs as ImageConfig);
    if (imageSrc && imageSrc !== params.node.getAttr('imageSrc')) {
      const imageElement = new Image();
      imageElement.onload = () => {
        params.node.image(imageElement);
        params.node.setAttr('imageSrc', imageSrc);
        params.node.getLayer()?.batchDraw();
      };
      imageElement.src = imageSrc;
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
    params.node.zIndex(config.zIndex);
    return params.node;
  }
}

export const imageNodeService = new ImageNodeService();
