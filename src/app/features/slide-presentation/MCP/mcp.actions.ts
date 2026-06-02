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
import { imageNodeService } from '../../../services/konva.services/image.service';
import { textNodeService } from '../../../services/konva.services/textNode.service';
import { shapeNodeService } from '../../../services/konva.services/shapeNode.service';
import { slideService } from '../../../services/konva.services/slide.service';
import { Slide } from '../domain/canvasModels/slide.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';

export class McpActions {
  constructor(private presentation: Presentation) {}

  private getSlideOrThrow(slideId: string): Slide {
    const slide = slideService.getSlideById({
      slideId,
      presentation: this.presentation,
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
      throw new InternalMcpError('Node of ');
    }
    const component = slide.components.splice(index, 1)[0];
    slide.controller.removeSelectionOfComponent(component.node);
    component.destroy();
    slide.controller.layer.batchDraw();
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

  addShape(args: {
    slideId: string;
    shapeType: ShapeType;
    initialConfig?: { attrs?: ShapeConfig; zIndex?: number };
  }) {
    const slide = this.getSlideOrThrow(args.slideId);
    shapeNodeService.addShapeNode({
      eventBus: this.presentation.eventBus,
      slide: slide,
      shapeType: args.shapeType,
      config: this.normalizeInitialConfig(args.initialConfig),
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

    shapeNodeService.updateShapeNode({
      node: node.node,
      config: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
  }

  deleteShape(args: { slideId: string; nodeId: string }) {
    this.removeComponent(args);
  }
  // Text

  addText(args: {
    slideId: string;
    initialConfig?: { attrs?: TextConfig; zIndex?: number };
  }) {
    const slide = this.getSlideOrThrow(args.slideId);
    textNodeService.addTextNode({
      eventBus: this.presentation.eventBus,
      slide,
      config: this.normalizeInitialConfig(args.initialConfig),
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

    textNodeService.updateTextNode({
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
    imageNodeService.addImageNode({
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

    imageNodeService.updateImageNode({
      node: node.node,
      currentConfig: configs.currentConfig,
      zIndexActions: args.zIndexActions,
    });
  }

  deleteImage(args: { slideId: string; nodeId: string }) {
    this.removeComponent(args);
  }

  getSlides() {
    return this.presentation.slides.map((slide) => slide.toJson());
  }

  getSlide() {}

  addSlide() {
    slideService.addSlide({ presentation: this.presentation });
  }

  removeSlide(args: { slideId: string }) {
    slideService.removeSlide({
      presentation: this.presentation,
      slideId: args.slideId,
    });
  }
}
