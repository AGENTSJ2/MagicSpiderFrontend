import { ImageConfig, Image as KonvaImage, } from 'konva/lib/shapes/Image';
import {
  ComponentConfig,
  PresentationEventStream,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import { ImageComponent, SerializableImageConfig } from '../domain/canvasModels/imageComponent';

export default class ImageController extends BaseController {
  override node: KonvaImage;
  override canvasComponent:ImageComponent;
  constructor(init: {
    slide: Slide;
    imageNode: ImageComponent;
    eventBus: PresentationEventStream;
  }) {
    super({ canvasComponent: init.imageNode, slide: init.slide });
    this.node = init.imageNode.node;
    this.canvasComponent = init.imageNode;
    this.registerEvents();
  }

  protected registerEvents(): void {
    this.handleNodeClick();
    this.handleTransformEvents();
    this.handleDragEvents();
    document.addEventListener('keydown', this.handleKeyboardStrokes);
  }

  override destroy(): void {
    this.node.remove();
    document.removeEventListener('keydown', this.handleKeyboardStrokes);
  }
  private updateImageNode(params: {
    currentConfig: ComponentConfig<SerializableImageConfig>;
    zIndexActions?: ZIndexActions;
  }): KonvaImage | undefined {
    const config = params.currentConfig;
    if (!config) {
      return;
    }
    const { imageSrc, ...attrs } = config.attrs;
    this.node.setAttrs(attrs as ImageConfig);
    if(config.zIndex !== undefined) {
      this.node.zIndex(config.zIndex);
    }

    if (imageSrc && imageSrc !== this.node.getAttr('imageSrc')) {
      const imageElement = new Image();
      imageElement.onload = () => {
        this.node.image(imageElement);
        this.node.setAttr('imageSrc', imageSrc);
        this.node.getLayer()?.batchDraw();
      };
      imageElement.src = imageSrc;
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
    return this.node;
  }
  override applyConfigurations(event: {
    currentConfig: ComponentConfig<SerializableImageConfig>;
    zIndexActions?: ZIndexActions;
  }) :ImageComponent{
    const config = event.currentConfig;
    this.updateImageNode({
      currentConfig: config,
      zIndexActions: event.zIndexActions,
    });
    super.applyConfigurations(event);
    return this.canvasComponent;
  }

  protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
    if (
      event.key === 'Delete' &&
      this.slide.controller.isNodeSelected(this.node)
    ) {
      this.handleRemove();
    }
  };
}
