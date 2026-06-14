import { ShapeConfig } from 'konva/lib/Shape';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import {
  ComponentConfig,
  ZIndexActions,
} from '../domain/EventModels/presentationEvents.model';
import ShapeComponent, {
  ShapeType,
} from '../domain/canvasModels/shapeComponent.model';
import { InternalMcpError } from './mcp.erros';
import { TextConfig } from 'konva/lib/shapes/Text';
import { TextComponent } from '../domain/canvasModels/textComponent.model';
import {
  ImageComponent,
  SerializableImageConfig,
} from '../domain/canvasModels/imageComponent';
import { imageNodeService } from '../../../services/konva.services/image.service';
import { textNodeService } from '../../../services/konva.services/textNode.service';
import { shapeNodeService } from '../../../services/konva.services/shapeNode.service';
import { slideService } from '../../../services/konva.services/slide.service';
import { Slide } from '../domain/canvasModels/slide.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';
import {
  AddTextSchema,
  AddShapeSchema,
  updateSchema,
  deleteSchema,
  AddImageSchema,
  RemoveSlideSchema,
} from './McpSchemas';
import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { Injectable } from '@angular/core';
import { ActivePresentationContext } from '../services/active-presentation.context';

@Injectable({
  providedIn: 'root',
})
export class McpActions {
  constructor(private presentationContext: ActivePresentationContext) {}

  private getPresentationOrThrow(): Presentation {
    const presentation = this.presentationContext.activePresentation;
    if (!presentation) {
      throw new InternalMcpError('User has no active presentation');
    }
    return presentation;
  }

  private getSlideOrThrow(slideId: string): Slide {
    const presentation = this.getPresentationOrThrow();
    const slide = slideService.getSlideById({
      slideId,
      presentation: presentation,
    });
    if (!slide) {
      throw new InternalMcpError(`No slide of ${slideId} is found`);
    }
    return slide;
  }

  private getComponentOrThrow<T extends ICanvasComponent>(args: {
    slideId: string;
    nodeId: string;
  }): T {
    const slide = this.getSlideOrThrow(args.slideId);
    const component = slide.components.find(
      (comp) => comp.node._id.toString() === args.nodeId,
    ) as T | undefined;

    if (!component) {
      throw new InternalMcpError(`No node of ${args.nodeId} is Found`);
    }
    return component;
  }

  private removeComponent(args: { slideId: string; nodeId: string }) {
    const slide = this.getSlideOrThrow(args.slideId);
    const index = slide.components.findIndex(
      (component) => component.node._id.toString() === args.nodeId,
    );
    if (index < 0) {
      throw new InternalMcpError(`No node of ${args.nodeId} is found`);
    }
    const component = slide.components.splice(index, 1)[0];
    slide.controller.removeSelectionOfComponent(component.node);
    component.destroy();
    slide.controller.layer.batchDraw();
    return component;
  }

  private normalizeInitialConfig<T>(config?: {
    attrs?: T;
    zIndex?: number;
  }): ComponentConfig<T> {
    return {
      attrs: config?.attrs ?? ({} as T),
      zIndex: config?.zIndex ?? 0,
    };
  }

  async addShape(
    args: z.infer<typeof AddShapeSchema>,
  ): Promise<CallToolResult> {
    const slide = this.getSlideOrThrow(args.slideId);
    const shape = shapeNodeService.addShapeNode({
      eventBus: this.getPresentationOrThrow().eventBus,
      slide: slide,
      shapeType: args.shapeType,
      config: this.normalizeInitialConfig(args.initialConfig),
    });
    const result: CallToolResult = {
      content: [{ type: 'text', text: `Added shape ${shape.node._id}` }],
    };
    return result;
  }

  async updateShape(
    args: z.infer<typeof updateSchema>,
  ): Promise<CallToolResult> {
    const node = this.getComponentOrThrow<ShapeComponent>(args);
    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? node.node.zIndex(),
      },
    });

    const shape = shapeNodeService.updateShapeNode({
      node: node.node,
      config: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
    const result: CallToolResult = {
      content: [{ type: 'text', text: `Updated shape ${shape?._id}` }],
    };
    return result;
  }

  async deleteComponent(
    args: z.infer<typeof deleteSchema>,
  ): Promise<CallToolResult> {
    const removed = this.removeComponent(args);
    return {
      content: [
        { type: 'text', text: `Removed component of id ${removed.node._id}` },
      ],
    };
  }
  // Text

  async addText(args: z.infer<typeof AddTextSchema>): Promise<CallToolResult> {
    const slide = this.getSlideOrThrow(args.slideId);
    const text = textNodeService.addTextNode({
      eventBus: this.getPresentationOrThrow().eventBus,
      slide,
      config: this.normalizeInitialConfig(args.initialConfig),
    });
    return {
      content: [{ type: 'text', text: `Added text ${text?.node._id}` }],
    };
  }

  async updateText(
    args: z.infer<typeof updateSchema>,
  ): Promise<CallToolResult> {
    const node = this.getComponentOrThrow<TextComponent>(args);
    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? node.node.zIndex(),
      },
    });
    const text = textNodeService.updateTextNode({
      node: node.node,
      config: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
    return {
      content: [{ type: 'text', text: `Updated text ${text?._id}` }],
    };
  }

  // Image

  async addImage(
    args: z.infer<typeof AddImageSchema>,
  ): Promise<CallToolResult> {
    const slide = this.getSlideOrThrow(args.slideId);
    const image = imageNodeService.addImageNode({
      eventBus: this.getPresentationOrThrow().eventBus,
      slide,
      config: { attrs: {}, zIndex: 0 },
    });
    return {
      content: [{ type: 'text', text: `Added image ${image.node._id}` }],
    };
  }

  updateImage(args: z.infer<typeof updateSchema>): CallToolResult {
    const node = this.getComponentOrThrow<ImageComponent>(args);
    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? node.node.zIndex(),
      },
    });
    const image = imageNodeService.updateImageNode({
      node: node.node,
      currentConfig: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
    return {
      content: [{ type: 'text', text: `Updated image ${image?._id}` }],
    };
  }

  addSlide(): CallToolResult {
    const slide = slideService.addSlide({ presentation: this.getPresentationOrThrow() });
    return {
      content: [{ type: 'text', text: `Added slide ${slide?.slideId}` }],
    };
  }

  removeSlide(args: z.infer<typeof RemoveSlideSchema>): CallToolResult {
    slideService.removeSlide({
      presentation: this.getPresentationOrThrow(),
      slideId: args.slideId,
    });
    return {
      content: [{ type: 'text', text: `Removed slide ${args.slideId}` }],
    };
  }
}
