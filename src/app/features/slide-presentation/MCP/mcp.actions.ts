import { ShapeConfig } from 'konva/lib/Shape';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import {
  ComponentConfig,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import {
  AddShapeEvent,
  RemoveShapeEvent,
  UpdateShapeEvent,
} from '../domain/EventModels/shapeEvent.models';
import ShapeComponent, {
  ShapeType,
} from '../domain/canvasModels/shapeComponent.model';
import { InternalMcpError } from './mcp.erros';
import {
  AddTextEvent,
  RemoveTextEvent,
  UpdateTextEvent,
} from '../domain/EventModels/textEvent.model';
import { TextConfig } from 'konva/lib/shapes/Text';
import { TextComponent } from '../domain/canvasModels/textComponent.model';
import {
  AddImageEvent,
  RemoveImageEvent,
  UpdateImageEvent,
} from '../domain/EventModels/imageEvent.model';
import { ImageConfig } from '@angular/common';
import { ImageComponent } from '../domain/canvasModels/imageComponent';
import { AddSlideEvent, RemoveSlideEvent } from '../domain/EventModels/slideEvent.model';

export class McpActions {
  constructor(private presentation: Presentation) {}

  addShape(args: { slideId: string; shapeType: ShapeType }) {
    this.presentation.publishEvent(
      new AddShapeEvent({
        nodeId: '',
        presentationId: this.presentation.id,
        slideId: args.slideId,
        shapeType: args.shapeType,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: undefined,
        trackHistory: true,
      }),
    );
  }

  updateShape(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<ShapeConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.presentation.slides
      .find((sl) => sl.slideId == args.slideId)
      ?.components.find(
        (comp) => comp.node._id.toString() == args.nodeId,
      ) as ShapeComponent;
    if (!node) {
      throw new InternalMcpError();
    }
    const configs = node.controller.getConfigsOfNode({
      newConfig: args.newConfig,
    });

    this.presentation.publishEvent(
      new UpdateShapeEvent({
        nodeId: args.nodeId,
        presentationId: this.presentation.id,
        slideId: args.slideId,
        shapeType: node.shapeType,
        currentConfig: configs.currentConfig,
        previousConfig: configs.previousConfig,
        zIndexActions: args.zIndexActions,
        trackHistory: true,
      }),
    );
  }

  deleteShape(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<ShapeConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.presentation.slides
      .find((sl) => sl.slideId == args.slideId)
      ?.components.find(
        (comp) => comp.node._id.toString() == args.nodeId,
      ) as ShapeComponent;
    if (!node) {
      throw new InternalMcpError();
    }
    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        attrs: {},
        zIndex: 0,
      },
    });

    this.presentation.publishEvent(
      new RemoveShapeEvent({
        presentationId: this.presentation.id,
        slideId: args.slideId,
        nodeId: args.nodeId,
        trackHistory: true,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: configs.previousConfig,
        shapeType: node.shapeType,
      }),
    );
  }
  // Text

  addText(args: { slideId: string }) {
    this.presentation.publishEvent(
      new AddTextEvent({
        nodeId: '',
        presentationId: this.presentation.id,
        slideId: args.slideId,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: undefined,
        trackHistory: true,
      }),
    );
  }

  updateText(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<TextConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.presentation.slides
      .find((sl) => sl.slideId === args.slideId)
      ?.components.find(
        (comp) => comp.node._id.toString() === args.nodeId,
      ) as TextComponent;

    if (!node) {
      throw new InternalMcpError();
    }

    const configs = node.controller.getConfigsOfNode({
      newConfig: args.newConfig,
    });

    this.presentation.publishEvent(
      new UpdateTextEvent({
        nodeId: args.nodeId,
        presentationId: this.presentation.id,
        slideId: args.slideId,
        currentConfig: configs.currentConfig,
        previousConfig: configs.previousConfig,
        zIndexActions: args.zIndexActions,
        trackHistory: true,
      }),
    );
  }

  deleteText(args: { slideId: string; nodeId: string }) {
    const node = this.presentation.slides
      .find((sl) => sl.slideId === args.slideId)
      ?.components.find(
        (comp) => comp.node._id.toString() === args.nodeId,
      ) as TextComponent;

    if (!node) {
      throw new InternalMcpError();
    }

    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        attrs: {},
        zIndex: 0,
      },
    });

    this.presentation.publishEvent(
      new RemoveTextEvent({
        presentationId: this.presentation.id,
        slideId: args.slideId,
        nodeId: args.nodeId,
        trackHistory: true,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: configs.previousConfig,
      }),
    );
  }

  // Image

  addImage(args: { slideId: string }) {
    this.presentation.publishEvent(
      new AddImageEvent({
        nodeId: '',
        presentationId: this.presentation.id,
        slideId: args.slideId,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: undefined,
        trackHistory: true,
      }),
    );
  }

  updateImage(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<ImageConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.presentation.slides
      .find((sl) => sl.slideId === args.slideId)
      ?.components.find(
        (comp) => comp.node._id.toString() === args.nodeId,
      ) as ImageComponent;

    if (!node) {
      throw new InternalMcpError();
    }

    const configs = node.controller.getConfigsOfNode({
      newConfig: args.newConfig,
    });

    this.presentation.publishEvent(
      new UpdateImageEvent({
        nodeId: args.nodeId,
        presentationId: this.presentation.id,
        slideId: args.slideId,
        currentConfig: configs.currentConfig,
        previousConfig: configs.previousConfig,
        zIndexActions: args.zIndexActions,
        trackHistory: true,
      }),
    );
  }

  deleteImage(args: { slideId: string; nodeId: string }) {
    const node = this.presentation.slides
      .find((sl) => sl.slideId === args.slideId)
      ?.components.find(
        (comp) => comp.node._id.toString() === args.nodeId,
      ) as ImageComponent;

    if (!node) {
      throw new InternalMcpError();
    }

    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        attrs: {},
        zIndex: 0,
      },
    });

    this.presentation.publishEvent(
      new RemoveImageEvent({
        presentationId: this.presentation.id,
        slideId: args.slideId,
        nodeId: args.nodeId,
        trackHistory: true,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: configs.previousConfig,
      }),
    );
  }

  getSlides() {}

  getSlide() {}

  addSlide() {
    const slideEvent = new AddSlideEvent({
      presentationId: this.presentation.id,
      slideId: '',
      nodeId: '',
      trackHistory: true,
    });
    this.presentation.publishEvent(slideEvent);
  }

  removeSlide(args:{slideId:string}) {
    const removeSlideEvent = new RemoveSlideEvent({
      presentationId: this.presentation.id,
      slideId: args.slideId,
      nodeId: '',
      trackHistory: true,
    });
    this.presentation.publishEvent(removeSlideEvent);
  }
}
