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
import { SerializableImageConfig } from '../domain/EventModels/imageEvent.model';
import { ImageComponent } from '../domain/canvasModels/imageComponent';
import { inject } from '@angular/core';
import { ImageNodeService } from '../../../services/konva.services/image.service';
import { TextNodeService } from '../../../services/konva.services/textNode.service';
import { ShapeNodeService } from '../../../services/konva.services/shapeNode.service';
import { SlideService } from '../../../services/konva.services/slide.service';
import { Slide } from '../domain/canvasModels/slide.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';

export class McpActions {
  private imageNodeService: ImageNodeService;
  private textNodeService: TextNodeService;
  private shapeNodeService: ShapeNodeService;
  private slideService: SlideService;
  constructor(private presentation: Presentation) {
    this.imageNodeService = inject(ImageNodeService);
    this.textNodeService = inject(TextNodeService);
    this.shapeNodeService = inject(ShapeNodeService);
    this.slideService = inject(SlideService);
  }

  private getSlideOrThrow(slideId: string): Slide {
    const slide = this.slideService.getSlideById({
      slideId,
      presentation: this.presentation,
    });
    if (!slide) {
      throw new InternalMcpError('Slide not found');
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
      throw new InternalMcpError('Node not found');
    }
    return component;
  }

  private removeComponent(args: { slideId: string; nodeId: string }) {
    const slide = this.getSlideOrThrow(args.slideId);
    const index = slide.components.findIndex(
      (component) => component.node._id.toString() === args.nodeId,
    );
    if (index < 0) {
      throw new InternalMcpError('Node not found');
    }
    const component = slide.components.at(index)!;
    component.node.remove();
    slide.controller.removeSelectionOfComponent(component.node);
    component.destroy();
    slide.controller.layer.batchDraw();
  }

  addShape(args: { slideId: string; shapeType: ShapeType }) {
    const slide = this.getSlideOrThrow(args.slideId);
    this.shapeNodeService.addShapeNode({
      eventBus: this.presentation.eventBus,
      slide: slide,
      shapeType: args.shapeType,
      config: { attrs: {}, zIndex: 0 },
    });
  }

  updateShape(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<ShapeConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.getComponentOrThrow<ShapeComponent>(args);
    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? node.node.zIndex(),
      },
    });

    this.shapeNodeService.updateShapeNode({
      node: node.node,
      config: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
  }

  deleteShape(args: { slideId: string; nodeId: string }) {
    this.removeComponent(args);
  }
  // Text

  addText(args: { slideId: string }) {
    const slide = this.getSlideOrThrow(args.slideId);
    this.textNodeService.addTextNode({
      eventBus: this.presentation.eventBus,
      slide,
      config: { attrs: {}, zIndex: 0 },
    });
  }

  updateText(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<TextConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.getComponentOrThrow<TextComponent>(args);

    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? node.node.zIndex(),
      },
    });

    this.textNodeService.updateTextNode({
      node: node.node,
      config: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
  }

  deleteText(args: { slideId: string; nodeId: string }) {
    this.removeComponent(args);
  }

  // Image

  addImage(args: { slideId: string }) {
    const slide = this.getSlideOrThrow(args.slideId);
    this.imageNodeService.addImageNode({
      eventBus: this.presentation.eventBus,
      slide,
      config: { attrs: {}, zIndex: 0 },
    });
  }

  updateImage(args: {
    slideId: string;
    nodeId: string;
    newConfig: ComponentConfig<SerializableImageConfig>;
    zIndexActions?: ZIndexActions;
  }) {
    const node = this.getComponentOrThrow<ImageComponent>(args);

    const configs = node.controller.getConfigsOfNode({
      newConfig: {
        ...args.newConfig,
        zIndex: args.newConfig.zIndex ?? node.node.zIndex(),
      },
    });

    this.imageNodeService.updateImageNode({
      node: node.node,
      currentConfig: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
  }

  deleteImage(args: { slideId: string; nodeId: string }) {
    this.removeComponent(args);
  }

  getSlides() {
    return this.presentation.slides.map((slide) => JSON.stringify(slide));
  }

  getSlide() {}

  addSlide() {
    this.slideService.addSlide({ presentation: this.presentation });
  }

  removeSlide(args: { slideId: string }) {
    this.slideService.removeSlide({
      presentation: this.presentation,
      slideId: args.slideId,
    });
  }
}
