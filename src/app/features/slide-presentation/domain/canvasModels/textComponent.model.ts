import Konva from 'konva';
import TextController from '../../controllers/text.controller';
import { Slide } from './slide.model';
import { ICanvasComponent } from './ICanvasComponent';
import {
  ComponentConfig,
  PresentationEventStream,
  PresentationEventType,
  ZIndexActions,
} from '../EventModels/presentationEvents.model';
import { TextConfig } from 'konva/lib/shapes/Text';
import { ShapeConfig } from 'konva/lib/Shape';

export class TextComponent implements ICanvasComponent {
  node: Konva.Text;
  config: ComponentConfig<TextToolboxConfig>;
  slide: Slide;
  controller: TextController;

  constructor(
    init: Partial<TextComponent> & { eventBus: PresentationEventStream },
  ) {
    this.config = init.config!;
    this.slide = init.slide!;
    this.node = new Konva.Text({
      ...(this.config?.attrs ? this.config.attrs : {}),
      x: init.config?.attrs.x ?? 10,
      y: init.config?.attrs.y ?? 10,
      text: init.config?.attrs.text ?? 'New Text',
      fontSize: init.config?.attrs.fontSize ?? 50,
      draggable: true,
    });
    this.controller = new TextController({
      slide: this.slide,
      canvasComponent: this,
      eventBus: init.eventBus,
    });
  }
  destroy(): void {
    this.controller.destroy();
    this.node.destroy();
  }
  updateComponent(params: {
    newConfig: ComponentConfig<TextConfig>;
    previousConfig?: ComponentConfig<TextConfig>;
    trackHistory?: boolean;
    zIndexActions?: ZIndexActions;
  }): TextComponent {
    const zIndex = this.node.zIndex();
    const oldConfig: ComponentConfig<TextConfig> = {
      attrs: this.node.toObject().attrs,
      zIndex: zIndex,
    };
    const updatedComp = this.controller.applyConfigurations({
      currentConfig: params.newConfig,
      zIndexActions: params.zIndexActions,
    });
    const newConfig: ComponentConfig<TextConfig> = {
      attrs: this.node.toObject().attrs,
      zIndex: zIndex,
    };
    this.slide.presentation.emitEvent({
      slide: this.slide,
      component: this,
      eventType: PresentationEventType.UPDATE,
      oldConfig: oldConfig,
      newConfig: newConfig,
    });
    return updatedComp;
  }
}
export type ListType = 'none' | 'bullet' | 'number';
export type BulletStyle = 'disc' | 'circle' | 'square' | 'dash' | 'check';
export type NumberStyle =
  | 'decimal'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman';
export interface TextToolboxConfig extends TextConfig {
  rawText?: string;
  listType?: ListType;
  bulletStyle?: BulletStyle;
  numberStyle?: NumberStyle;
}
