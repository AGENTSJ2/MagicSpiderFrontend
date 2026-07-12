import Konva from 'konva';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import {
  ComponentConfig,
  PresentationEventStream,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import { Subscription } from 'rxjs';
import { TextConfig } from 'konva/lib/shapes/Text';
import { TextComponent } from '../domain/canvasModels/textComponent.model';

export default class TextController extends BaseController {
  private eventSubscription!: Subscription;
  override node: Konva.Text;
  override canvasComponent: TextComponent;
  constructor(init: {
    slide: Slide;
    canvasComponent: TextComponent;
    eventBus: PresentationEventStream;
  }) {
    super({ canvasComponent: init.canvasComponent, slide: init.slide });
    this.node = init.canvasComponent.node;
    this.canvasComponent = init.canvasComponent;
    this.registerEvents();
  }

  protected registerEvents() {
    this.handleNodeClick();
    this.handleTransformEvents();
    this.handleDragEvents();
    document.addEventListener('keydown', this.handleKeyboardStrokes);
  }
  private updateTextNode(params: {
    zIndexActions?: ZIndexActions;
    config: ComponentConfig<TextConfig>;
  }) {
    this.node.setAttrs(params.config.attrs);
    if(params.config.zIndex !== undefined) {
      this.node.zIndex(params.config.zIndex);
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
  }
  override applyConfigurations(event: {
    currentConfig: ComponentConfig<TextConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const config = event.currentConfig;
    this.updateTextNode({
      config: config,
      zIndexActions: event.zIndexActions,
    });
    super.applyConfigurations(event);
    return this.canvasComponent;
  }

  override destroy() {
    this.node.remove();
    document.removeEventListener('keydown', this.handleKeyboardStrokes);
    this.eventSubscription.unsubscribe();
  }

  protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
    if (
      event.key === 'Delete' &&
      this.slide.controller.isNodeSelected(this.node) &&
      this.slide.slideId == this.slide.presentation.getActiveSlide?.slideId
    ) {
      super.handleRemove();
    }
  };
}
