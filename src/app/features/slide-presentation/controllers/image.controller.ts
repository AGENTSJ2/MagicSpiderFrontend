import { Image as KonvaImage, ImageConfig } from 'konva/lib/shapes/Image';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import { imageNodeService } from '../../../services/konva.services/image.service';
import { ImageComponent, SerializableImageConfig } from '../domain/canvasModels/imageComponent';

export default class ImageController extends BaseController {
  override undoEvent(presentationEvent: PresentationEvent): void {
    throw new Error('Method not implemented.');
  }
  override redoEvent(presentationEvent: PresentationEvent): void {
    throw new Error('Method not implemented.');
  }
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

  applyConfigurations(event: {
    currentConfig: ComponentConfig<SerializableImageConfig>;
    zIndexActions?: ZIndexActions;
  }) :ImageComponent{
    const config = event.currentConfig;
    imageNodeService.updateImageNode({
      currentConfig: config,
      node: this.node,
      zIndexActions: event.zIndexActions,
    });
    return this.canvasComponent;
  }

  private getSerializableConfig(): ComponentConfig<SerializableImageConfig> {
    const attrs = { ...this.node.getAttrs() };
    delete attrs['image'];
    return {
      attrs,
      zIndex: this.node.getZIndex(),
    };
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
