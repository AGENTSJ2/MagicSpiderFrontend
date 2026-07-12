import { Presentation } from '../domain/canvasModels/presenatation.model';
import { ComponentConfig } from '../domain/EventModels/presentationEvents.model';
import ShapeComponent from '../domain/canvasModels/shapeComponent.model';
import { InternalMcpError } from './mcp.erros';
import { TextComponent } from '../domain/canvasModels/textComponent.model';
import { ImageComponent } from '../domain/canvasModels/imageComponent';
import { Slide } from '../domain/canvasModels/slide.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';
import {
  AddTextSchema,
  AddShapeSchema,
  updateSchema,
  deleteSchema,
  AddImageSchema,
  RemoveSlideSchema,
  updateTextSchema,
} from './McpSchemas';
import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { Injectable } from '@angular/core';
import { ActivePresentationContext } from '../services/active-presentation.context';
import { getFormattedText, getImageDimensions } from '../../../core/utilities';
import blobService from '../../../services/blob.service';

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
    const slide = presentation.slides.find(
      (sl) => sl.slideId == slideId,
    );
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
    const shape = slide.addShape({
      shapeType: args.shapeType,
      config: this.normalizeInitialConfig(args.initialConfig),
    });
    const result: CallToolResult = {
      content: [{ type: 'text', text: `Added shape ${shape?.node?._id}` }],
    };
    return result;
  }

  async updateShape(
    args: z.infer<typeof updateSchema>,
  ): Promise<CallToolResult> {
    const shapeComponent = this.getComponentOrThrow<ShapeComponent>(args);
    const configs = shapeComponent.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? shapeComponent.node.zIndex(),
      },
    });
    shapeComponent.updateComponent({
      newConfig: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
    const result: CallToolResult = {
      content: [
        { type: 'text', text: `Updated shape ${shapeComponent?.node?._id}` },
      ],
    };
    return result;
  }

  async deleteComponent(
    args: z.infer<typeof deleteSchema>,
  ): Promise<CallToolResult> {
    const removed = this.removeComponent(args);
    return {
      content: [
        { type: 'text', text: `Removed component of id ${removed?.node?._id}` },
      ],
    };
  }

  // Text
  async addText(args: z.infer<typeof AddTextSchema>): Promise<CallToolResult> {
    const slide = this.getSlideOrThrow(args.slideId);
    const initialConfig = this.normalizeInitialConfig(
      args.initialConfig,
    ) as any;
    if (initialConfig.attrs.text) {
      initialConfig.attrs.text = getFormattedText(
        initialConfig.attrs.text,
        initialConfig.attrs.listType,
        initialConfig.attrs.bulletStyle,
        initialConfig.attrs.numberStyle,
      );
    }
    const text = slide.addText({
      config: initialConfig,
    });
    return {
      content: [{ type: 'text', text: `Added text ${text?.node?._id}` }],
    };
  }

  async updateText(
    args: z.infer<typeof updateTextSchema>,
  ): Promise<CallToolResult> {
    const textComponent = this.getComponentOrThrow<TextComponent>(args);
    const configs = textComponent.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? textComponent.node.zIndex(),
      },
    });
    if (configs.currentConfig.text) {
      configs.currentConfig.text = getFormattedText(
        configs.currentConfig.attrs.text,
        configs.currentConfig.attrs.listType,
        configs.currentConfig.attrs.bulletStyle,
        configs.currentConfig.attrs.numberStyle,
      );
    }
    const text = textComponent.updateComponent({
      newConfig: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
    return {
      content: [{ type: 'text', text: `Updated text ${text?.node?._id}` }],
    };
  }

  // Image
  async addImage(
    args: z.infer<typeof AddImageSchema>,
  ): Promise<CallToolResult> {
    const slide = this.getSlideOrThrow(args.slideId);
    const initialConfig = this.normalizeInitialConfig(
      args.initialConfig,
    ) as any;
    const image = slide.addImage({
      config: initialConfig,
    });
    const result: CallToolResult = {
      content: [{ type: 'text', text: `Added Image ${image?.node?._id}` }],
    };
    return result;
  }

  updateImage(args: z.infer<typeof updateSchema>): CallToolResult {
    const imageComponent = this.getComponentOrThrow<ImageComponent>(args);
    const configs = imageComponent.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? imageComponent.node.zIndex(),
      },
    });
    imageComponent.updateComponent({
      newConfig: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
    return {
      content: [
        { type: 'text', text: `Updated image ${imageComponent?.node?._id}` },
      ],
    };
  }

  addSlide(): CallToolResult {
    const presentation = this.getPresentationOrThrow();
    const slide = presentation.addSlide();
    return {
      content: [{ type: 'text', text: `Added slide ${slide?.slideId}` }],
    };
  }

  removeSlide(args: z.infer<typeof RemoveSlideSchema>): CallToolResult {
    const presentation = this.getPresentationOrThrow();
    const slide = this.getSlideOrThrow(args.slideId);
    presentation.removeSlide(slide);
    return {
      content: [{ type: 'text', text: `Removed slide ${args.slideId}` }],
    };
  }

  async getAvailableImageList(): Promise<CallToolResult> {
    const list = await blobService.getAllImages();
    const imgs: any[] = [];
    for (const img of list) {
      const {height , width } = await getImageDimensions(img.imageSrc);
      imgs.push({
        id: img.id,
        description: img.description,
        height: height,
        width: width,
      });
    }
   
    const text = JSON.stringify(imgs);
    return {
      content: [
        {
          type: 'resource',
          resource: { uri: 'magicspider://availableImages', text },
        },
      ],
    };
  }
}
