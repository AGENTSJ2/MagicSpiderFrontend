import Konva from 'konva';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  PresentationEventType,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import { Subscription } from 'rxjs';
import { TextConfig } from 'konva/lib/shapes/Text';
import { textNodeService } from '../../../services/konva.services/textNode.service';
import { TextComponent } from '../domain/canvasModels/textComponent.model';

export default class TextController extends BaseController {
  private readonly positionSlack = 5;
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

  applyConfigurations(event: {
    currentConfig: ComponentConfig<TextConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const config = event.currentConfig;
    textNodeService.updateTextNode({
      node: this.node,
      config: config,
      zIndexActions: event.zIndexActions,
    });
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
      this.slide.controller.isNodeSelected(this.node)
    ) {
      super.handleRemove();
    }
  };
}
