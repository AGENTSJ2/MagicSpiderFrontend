import Konva from 'konva';
import { Slide } from '../domain/canvasModels/slide.model';
import BaseController from './base.controller';
import {
  ComponentConfig,
  PresentationEventStream,
  PresentationEventType,
  ZIndexActions,
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
import { TextNodeService } from '../../../services/konva.services/textNode.service';
import { inject } from '@angular/core';

export default class TextController extends BaseController {
  private readonly positionSlack = 5;
  private slide: Slide;
  private containerDiv: HTMLDivElement;
  private eventSubscription!: Subscription;
  override node: Konva.Text;
  private textNodeService = inject(TextNodeService);
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
  }

  protected listenPresentationEventStream() {
    this.eventSubscription = this.eventBus.subscribe((event) => {
      if (
        !(event instanceof TextEvent) ||
        event.nodeId != this.node._id.toString()
      ) {
        return;
      }
      if (event instanceof UpdateTextEvent) {
        this.applyConfigurations(event);
        return;
      }
    });
  }

  private applyConfigurations(event: UpdateTextEvent) {
    const config = event.currentConfig;
    if (!config) {
      return;
    }
    this.textNodeService.updateTextNode({
      node:this.node,
      config:config,
      zIndexActions:event.zIndexActions
    })
  }

  override destroy() {
    this.node.remove();
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

  protected override handleKeyboardStrokes = (event: KeyboardEvent) => {
    if (
      event.key === 'Delete' &&
      this.slide.controller.isNodeSelected(this.node)
    ) {
      super.handleRemove();
    }
  };
}
