import Konva from 'konva';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import {
  ComponentConfig,
  PresentationEventStream,
  PresentationEventType,
} from '../domain/EventModels/presentationEvents.model';
import { Subscription } from 'rxjs';
import { TextConfig } from 'konva/lib/shapes/Text';
import {
  AddTextEvent,
  RemoveTextEvent,
  SelectTextEvent,
  TextEvent,
  UpdateTextEvent,
} from '../domain/EventModels/textEvent.model';

export default class TextController extends BaseController {
  private textareaToEditText: HTMLTextAreaElement | undefined;
  private readonly positionSlack = 5;
  private slide: Slide;
  private containerDiv: HTMLDivElement;
  private eventSubscription!: Subscription;
  override node: Konva.Text;

  constructor(init: {
    slide: Slide;
    textNode: Konva.Text;
    eventBus: PresentationEventStream;
  }) {
    super({ node: init.textNode, eventBus: init.eventBus });
    this.slide = init.slide;
    this.containerDiv = init.slide.containerDiv;
    this.node = init.textNode;
    this.registerEvents();
    this.listenPresentationEventStream();
  }

  protected registerEvents() {
    this.handleNodeClick();
    this.handleTransformEvents();
    this.handleDragEvents();
    document.addEventListener('keydown', this.handleKeyboardStrokes);
    this.node.on('dblclick', () => {
      this.slide.controller.removeSelectionOfComponent(this.node);
      const { x, y } = this.node.getAbsolutePosition();
      // creating textarea
      this.textareaToEditText = document.createElement('textarea');
      this.textareaToEditText.value = this.node.text();
      this.textareaToEditText.style.position = 'absolute';
      this.textareaToEditText.style.left = x + 'px';
      this.textareaToEditText.style.top = y - this.positionSlack + 'px';
      this.textareaToEditText.style.width = 'auto';
      this.textareaToEditText.style.height = 'auto';
      this.textareaToEditText.style.fontSize = this.node.fontSize() + 'px';
      this.textareaToEditText.style.fontFamily = this.node.fontFamily();
      this.containerDiv.appendChild(this.textareaToEditText);
      this.textareaToEditText.focus();
      // click event seems to run as it was set inside dblClick hence mousedown is used
      document.addEventListener('mousedown', this.boundRespondToClick);
    });
  }

  protected listenPresentationEventStream() {
    this.eventSubscription = this.eventBus.subscribe((event) => {
      if (
        !(event instanceof TextEvent) ||
        event.nodeId != this.node.id()
      ) {
        return;
      }
      if (event instanceof UpdateTextEvent) {
        this.applyConfigurations(event.currentConfig);
        return;
      }
      if (event instanceof RemoveTextEvent) {
        this.destroy();
        return;
      }
    });
  }

  private applyConfigurations(config?: ComponentConfig<TextConfig>) {
    if (!config) {
      // config null means deletion of node (designed to perform undo operations on create operation)
      this.destroy();
      return;
    }
    this.node.setAttrs(config);
    this.node.zIndex(config.zIndex);
  }

  protected override destroy() {
    this.node.remove();
    this.slide.controller.removeSelectionOfComponent(this.node);
    document.removeEventListener('keydown', this.handleKeyboardStrokes);
    this.eventSubscription.unsubscribe();
  }

  protected override getEventObject(data: {
    eventType: PresentationEventType;
    newConfig: ComponentConfig<TextConfig>;
    previousConfig?: ComponentConfig<TextConfig>;
    trackHistory?: boolean;
  }): TextEvent {
    const defaultEvent: TextEvent = {
      nodeId: this.node._id.toString(),
      presentationId: this.slide.presentationId,
      slideId: this.slide.slideId,
      previousConfig: structuredClone(!data.previousConfig ? { attrs: this.node.getAttrs(), zIndex: this.node.zIndex() } : data.previousConfig),
      trackHistory:
        data.trackHistory == undefined ? true : data.trackHistory,
      currentConfig: {
        attrs: {
          ...structuredClone(this.node.getAttrs()),
          ...data.newConfig.attrs,
        },
        zIndex: data.newConfig.zIndex,
      },

    }

    let event: TextEvent | undefined;
    switch (data.eventType) {
      case PresentationEventType.ADD:
        event = new AddTextEvent({
          ...defaultEvent
        });
        break;
      case PresentationEventType.UPDATE:
        event = new UpdateTextEvent({
          ...defaultEvent
        });
        break;
      case PresentationEventType.REMOVE:
        event = new RemoveTextEvent({
          ...defaultEvent,
          currentConfig: {
            attrs: {
            },
            zIndex: data.newConfig.zIndex,
          },
        });
        break;
      case PresentationEventType.SELECT:
        event = new SelectTextEvent({
          ...defaultEvent
        });
        break;
    }
    return event!;
  }

  private boundRespondToClick = (event: MouseEvent) => {
    if (this.textareaToEditText && event.target != this.textareaToEditText) {
      if (this.textareaToEditText.value.length != 0) {
        const updatedConfig = {
          attrs: {
            text: this.textareaToEditText.value,
          },
          zIndex: this.node.getZIndex(),
        };
        this.eventBus.next(
          this.getEventObject({
            eventType: PresentationEventType.UPDATE,
            newConfig: updatedConfig,
          }),
        );
      } else {
        // remove the node if no text is found
        this.eventBus.next(
          this.getEventObject({
            eventType: PresentationEventType.REMOVE,
            newConfig: { attrs: {}, zIndex: this.node.getZIndex() },
          }),
        );
      }
      this.textareaToEditText.remove();
      document.removeEventListener('mousedown', this.boundRespondToClick);
    }
  };

  protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
    if (
      event.key === 'Delete' &&
      this.slide.controller.isNodeSelected(this.node)
    ) {
      super.handleRemove();
    }
  };
}
