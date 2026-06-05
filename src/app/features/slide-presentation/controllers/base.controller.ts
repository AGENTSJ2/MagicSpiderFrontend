import { Shape, ShapeConfig } from 'konva/lib/Shape';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  PresentationEventType,
} from '../domain/EventModels/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';

export default abstract class BaseController {
  canvasComponent: ICanvasComponent;
  node: Shape;
  slide: Slide;
  constructor(init: { canvasComponent: ICanvasComponent; slide: Slide }) {
    this.canvasComponent = init.canvasComponent;
    this.node = init.canvasComponent.node;
    this.slide = init.slide;
  }

  /**
   * Call all events inside this.
   * Override this if you need custom behavior.
   */
  protected abstract registerEvents(): void;

  // protected abstract listenPresentationEventStream(): void;

  protected abstract destroy(): void;

  protected abstract handleKeyboardStrokes: (event: KeyboardEvent) => void;

  // abstract undoEvent(presentationEvent: PresentationEvent):void;
  // abstract redoEvent(presentationEvent: PresentationEvent) :void;

  protected handleNodeClick(): void {
    this.node.on('click', () => {
      this.slide.selectComponent(this.canvasComponent);
    });
  }

  protected handleDragEvents() {
    let XBeforeDrag: number = this.node.x();
    let YBeforeDrag: number = this.node.y();
    this.node.on('dragstart', () => {
      XBeforeDrag = this.node.x();
      YBeforeDrag = this.node.y();
    });
    this.node.on('dragend', () => {
      this.canvasComponent.updateComponent({
        newConfig: {
          attrs: {}, // doesn't require manual setting of x and y since the drag operation sets the x and y directly
          zIndex: this.node.zIndex(),
        },
        previousConfig: {
          attrs: {
            x: XBeforeDrag,
            y: YBeforeDrag,
          },
          zIndex: this.node.zIndex(),
        },
      });
      XBeforeDrag = this.node.x();
      YBeforeDrag = this.node.y();
    });
  }

  protected handleTransformEvents() {
    let widthBeforeTransform: number = this.node.width();
    let heightBeforeTransform: number = this.node.height();
    let rotationBeforeTransform: number = this.node.rotation();

    this.node.on('transformstart', () => {
      widthBeforeTransform = this.node.width();
      heightBeforeTransform = this.node.height();
      rotationBeforeTransform = this.node.rotation();
    });

    this.node.on('transform', () => {
      const scaleX = this.node.scaleX();
      const scaleY = this.node.scaleY();
      const newWidth = this.node.width() * scaleX;
      const newHeight = this.node.height() * scaleY;
      const updatedConfig: ComponentConfig<ShapeConfig> = {
        attrs: {
          width: newWidth,
          height: newHeight,
          scaleX: 1,
          scaleY: 1,
          rotation: this.node.rotation(),
        },
        zIndex: this.node.getZIndex(),
      };
      this.canvasComponent.updateComponent({
        newConfig: updatedConfig,
        trackHistory: false,
      });
    });

    this.node.on('transformend', () => {
      const updatedConfig: ComponentConfig<ShapeConfig> = {
        attrs: {
          width: this.node.width(),
          height: this.node.height(),
          scaleX: 1,
          scaleY: 1,
          rotation: this.node.rotation(),
        },
        zIndex: this.node.getZIndex(),
      };
      const prevConfig: ComponentConfig<ShapeConfig> = {
        attrs: {
          width: widthBeforeTransform,
          height: heightBeforeTransform,
          scaleX: 1,
          scaleY: 1,
          rotation: rotationBeforeTransform,
        },
        zIndex: this.node.getZIndex(),
      };
      this.canvasComponent.updateComponent({
        newConfig: updatedConfig,
        previousConfig: prevConfig,
        trackHistory: true,
      });
    });
  }

  protected handleRotationEvents() {}
  
  protected handleRemove() {
    this.slide.removeComponent(this.canvasComponent);
  }

  getConfigsOfNode(data: {
    newConfig: ComponentConfig<ShapeConfig>;
    previousConfig?: ComponentConfig<ShapeConfig>;
  }): {
    currentConfig: any;
    previousConfig: any;
  } {
    const configs = {
      currentConfig: {
        attrs: {
          ...structuredClone(this.node.getAttrs()),
          ...data.newConfig.attrs,
        },
        zIndex: data.newConfig.zIndex,
      },
      previousConfig: structuredClone(
        !data.previousConfig
          ? { attrs: this.node.getAttrs(), zIndex: this.node.zIndex() }
          : data.previousConfig,
      ),
    };
    return configs;
  }
  
  undoEvent(presentationEvent: PresentationEvent) {
    switch (presentationEvent.eventType) {
      case PresentationEventType.ADD:
        this.slide.removeComponent(this.canvasComponent, false);
        break;
      case PresentationEventType.REMOVE:
        this.slide.restoreComponent(presentationEvent.nodeId);
        break;
      case PresentationEventType.UPDATE:
        this.canvasComponent.updateComponent({
          newConfig: presentationEvent.previousConfig!,
          trackHistory: false,
        });
        break;
      default:
        throw new Error('Undo for this event is not determined.');
    }
  }

  redoEvent(presentationEvent: PresentationEvent) {
    switch (presentationEvent.eventType) {
      case PresentationEventType.ADD:
        this.slide.restoreComponent(presentationEvent.nodeId);
        break;
      case PresentationEventType.REMOVE:
        this.slide.removeComponent(this.canvasComponent, false);
        break;
      case PresentationEventType.UPDATE:
        this.canvasComponent.updateComponent({
          newConfig: presentationEvent.currentConfig!,
          trackHistory: false,
        });
        break;
      default:
        throw new Error('Redo for this event is not determined.');
    }
  }
}
