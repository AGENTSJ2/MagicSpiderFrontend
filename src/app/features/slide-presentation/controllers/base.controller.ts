import { Shape, ShapeConfig } from 'konva/lib/Shape';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  PresentationEventType,
} from '../domain/EventModels/presentationEvents.model';

export default abstract class BaseController {
  node: Shape;
  eventBus: PresentationEventStream;
  constructor(init: { node: Shape; eventBus: PresentationEventStream }) {
    this.node = init.node;
    this.eventBus = init.eventBus;
  }

  /**
   * Call all events inside this.
   * Override this if you need custom behavior.
   */
  protected abstract registerEvents(): void;

  protected abstract listenPresentationEventStream(): void;

  protected abstract destroy(): void;

  protected abstract handleKeyboardStrokes: (event: KeyboardEvent) => void;

  protected abstract getEventObject(data: {
    eventType: PresentationEventType;
    newConfig: ComponentConfig<ShapeConfig>;
    previousConfig?: ComponentConfig<ShapeConfig>;
    trackHistory?: boolean;
  }): PresentationEvent;

  protected handleNodeClick(): void {
    this.node.on('click', () => {
      this.eventBus.next(
        this.getEventObject({
          eventType: PresentationEventType.SELECT,
          newConfig: { attrs: {}, zIndex: this.node.zIndex() },
        }),
      );
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
      this.eventBus.next(
        this.getEventObject({
          eventType: PresentationEventType.UPDATE,
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
        }),
      );
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
      this.eventBus.next(
        this.getEventObject({
          eventType: PresentationEventType.UPDATE,
          newConfig: updatedConfig,
          trackHistory: false,
        }),
      );
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
      this.eventBus.next(
        this.getEventObject({
          eventType: PresentationEventType.UPDATE,
          newConfig: updatedConfig,
          previousConfig: prevConfig,
          trackHistory: true,
        }),
      );
    });
  }

  protected handleRotationEvents() {}
  protected handleRemove() {
    this.eventBus.next(
      this.getEventObject({
        eventType: PresentationEventType.REMOVE,
        newConfig: { attrs: {}, zIndex: this.node.getZIndex() },
      }),
    );
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
        attrs: { ...structuredClone(this.node.getAttrs()), ...data.newConfig.attrs },
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
}
