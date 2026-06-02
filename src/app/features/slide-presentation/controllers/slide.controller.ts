import { Shape } from 'konva/lib/Shape';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Stage } from 'konva/lib/Stage';
import { DocumentConfiguration } from '../domain/models/documentConfiguration.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';
import {
  ClearSelectionEvent,
  PresentationEvent,
  PresentationEventStream,
} from '../domain/EventModels/presentationEvents.model';
import { TextComponent } from '../domain/canvasModels/textComponent.model';
import ShapeComponent from '../domain/canvasModels/shapeComponent.model';
import { ImageComponent } from '../domain/canvasModels/imageComponent';
import { Slide } from '../domain/canvasModels/slide.model';
import { Subscription } from 'rxjs';
import {
  AddTextEvent,
  RemoveTextEvent,
  RestoreTextEvent,
  SelectTextEvent,
  TextEvent,
} from '../domain/EventModels/textEvent.model';
import {
  AddShapeEvent,
  RemoveShapeEvent,
  RestoreShapeEvent,
  SelectShapeEvent,
  ShapeEvent,
} from '../domain/EventModels/shapeEvent.models';
import {
  AddImageEvent,
  ImageEvent,
  RemoveImageEvent,
  RestoreImageEvent,
  SelectImageEvent,
} from '../domain/EventModels/imageEvent.model';
import {
  AddTrashEvents,
  RemoveFromTrashEvents,
} from '../domain/EventModels/trashEvents.model';
import { imageNodeService } from '../../../services/konva.services/image.service';
import { shapeNodeService } from '../../../services/konva.services/shapeNode.service';
import { textNodeService } from '../../../services/konva.services/textNode.service';

export default class SlideController {
  transformer!: Transformer;
  layer!: Layer;
  mainCover!: Rect;
  stage!: Stage;
  private slide: Slide;
  private readonly DESIRED_SLIDE_HEIGHT = 750;
  private eventBus: PresentationEventStream;
  private eventBusSubscription!: Subscription;
  private readonly Anchors = [
    'top-left',
    'top-center',
    'top-right',
    'middle-left',
    'middle-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];

  constructor(init: { eventBus: PresentationEventStream; slide: Slide }) {
    this.eventBus = init.eventBus;
    this.slide = init.slide;
    this.setUp();
    this.registerEvents();
    this.ListenPresentationEvents();
  }

  private setUp() {
    this.stage = new Stage({
      container: document.createElement('div'),
      width: 100,
      height: 100,
    });
    this.layer = new Layer();
    this.mainCover = new Rect({
      x: 0,
      y: 0,
      width: this.stage.width(),
      height: this.stage.height(),
      fill: 'white',
      stroke: 'black',
      strokeWidth: 0,
    });
    this.transformer = new Transformer({
      rotateEnabled: true,
      enabledAnchors: [
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      keepRatio: true,
      centeredScaling: false,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
      rotateAnchorOffset: 60,
      borderStroke: '#4A90E2',
      borderStrokeWidth: 1,
      anchorStroke: '#4A90E2',
      anchorFill: 'white',
      anchorSize: 8,
      anchorCornerRadius: 2,
      padding: 5,
      flipEnabled: false,
    });
    this.stage.add(this.layer);
    this.layer.add(this.mainCover);
    this.layer.add(this.transformer);
  }

  private registerEvents() {
    this.stage.on('mousedown', (e) => {
      // if clicked on empty area
      if (e.target === this.mainCover) {
        this.transformer?.nodes([]); // clears selection
        this.layer?.batchDraw();
        const clearSelection = new ClearSelectionEvent({
          slideId: this.slide.slideId,
          presentationId: this.slide.presentationId,
        });
        this.eventBus.next(clearSelection);
        return;
      }
    });
  }

  private ListenPresentationEvents() {
    this.eventBusSubscription = this.eventBus.subscribe(
      (event: PresentationEvent) => {
        if (event.slideId != this.slide.slideId) {
          return;
        }
        this.transformer.moveToTop(); // always move to top
        if (event instanceof TextEvent) {
          this.handleTextEvents(event);
        }
        if (event instanceof ShapeEvent) {
          this.handleShapeEvents(event);
        }
        if (event instanceof ImageEvent) {
          this.handleImageEvents(event);
        }
      },
    );
  }

  protected handleTextEvents(event: TextEvent) {
    if (event instanceof SelectTextEvent) {
      const nodeId = event.nodeId;
      let targetNode = this.slide.components.find(
        (nd) => nd.node._id.toString() == nodeId,
      );
      this.selectComponent(targetNode!.node);
      return;
    }
    if (event instanceof AddTextEvent) {
      this.handleAddNode(event);
      return;
    }
    if (event instanceof RemoveTextEvent) {
      this.handleRemoveNode(event);
      return;
    }
    if (event instanceof RestoreTextEvent) {
      this.handleRestoreNode(event);
      return;
    }
  }

  protected handleShapeEvents(event: ShapeEvent) {
    if (event instanceof SelectShapeEvent) {
      const nodeId = event.nodeId;
      let targetNode = this.slide.components.find(
        (nd) => nd.node._id.toString() == nodeId,
      );
      this.selectComponent(targetNode!.node);
      return;
    }
    if (event instanceof AddShapeEvent) {
      this.handleAddNode(event);
      return;
    }
    if (event instanceof RemoveShapeEvent) {
      this.handleRemoveNode(event);
      return;
    }
    if (event instanceof RestoreShapeEvent) {
      this.handleRestoreNode(event);
      return;
    }
  }

  protected handleImageEvents(event: ImageEvent) {
    if (event instanceof SelectImageEvent) {
      const nodeId = event.nodeId;
      let targetNode = this.slide.components.find(
        (nd) => nd.node._id.toString() == nodeId,
      );
      this.selectComponent(targetNode!.node);
      return;
    }
    if (event instanceof AddImageEvent) {
      this.handleAddNode(event);
      return;
    }
    if (event instanceof RemoveImageEvent) {
      this.handleRemoveNode(event);
      return;
    }
    if (event instanceof RestoreImageEvent) {
      this.handleRestoreNode(event);
      return;
    }
  }

  triggerResize(options: {
    divElm: HTMLDivElement;
    config: DocumentConfiguration;
  }) {
    this.slide.containerDiv = options.divElm;
    const desiredHeight = this.DESIRED_SLIDE_HEIGHT;
    const desiredWidth =
      desiredHeight * (options.config.ratio.num / options.config.ratio.den);

    const containerWidth = options.divElm.offsetWidth;
    const containerHeight =
      containerWidth * (options.config.ratio.den / options.config.ratio.num);
    const xScaleFactor = containerWidth / desiredWidth;
    const yScaleFactor = containerHeight / desiredHeight;

    this.stage.container(options.divElm);
    this.stage.height(containerHeight);
    this.stage.width(containerWidth);
    this.mainCover.height(desiredHeight);
    this.mainCover.width(desiredWidth);

    this.stage.scale({
      x: xScaleFactor,
      y: yScaleFactor,
    });
    this.layer.batchDraw();
  }

  isNodeSelected(node: Shape): boolean {
    return this.transformer.nodes().some((nd) => nd == node);
  }

  selectComponent(node: Shape, options?: { anchors: string[] }) {
    this.transformer.nodes([node]);
    this.transformer.enabledAnchors(options?.anchors ?? this.Anchors);
    this.layer.batchDraw();
  }

  removeSelectionOfComponent(node: Shape) {
    let selected = this.transformer.nodes();
    selected = selected.filter((nd) => nd != node);
    this.transformer.nodes(selected);
    this.layer.batchDraw();
  }

  addComponent(node: ICanvasComponent) {
    this.layer.add(node.node);
    this.slide.components.push(node);
  }

  destroy() {
    this.eventBusSubscription.unsubscribe();
    this.transformer.destroy();
  }

  private handleAddNode(event: PresentationEvent) {
    let node: ICanvasComponent | undefined;
    if (event instanceof AddTextEvent) {
      node = textNodeService.addTextNode({
        eventBus: this.eventBus,
        slide: this.slide,
        config: event.currentConfig!,
      });
    }
    if (event instanceof ShapeEvent) {
      node = shapeNodeService.addShapeNode({
        eventBus: this.eventBus,
        slide: this.slide,
        config: event.currentConfig!,
        shapeType: event.shapeType,
      });
    }
    if (event instanceof ImageEvent) {
      node = imageNodeService.addImageNode({
        eventBus: this.eventBus,
        slide: this.slide,
        config: event.currentConfig!,
      });
    }
    event.nodeId = node!.node!._id.toString();
    event.currentConfig =
      event instanceof ImageEvent
        ? structuredClone((node as ImageComponent).getSerializableConfig())
        : structuredClone({
            attrs: node!.node!.getAttrs(),
            zIndex: node!.node!.getZIndex(),
          });
    event.previousConfig = structuredClone(event.previousConfig);
  }

  private handleRemoveNode(event: PresentationEvent) {
    const index = this.slide.components.findIndex(
      (x) => x.node._id.toString() === event.nodeId,
    );
    if (index == -1) {
      return;
    }
    const removed = this.slide.components.splice(index, 1)[0];
    removed.node.remove();
    this.removeSelectionOfComponent(removed.node);
    const trashEvent = new AddTrashEvents({
      nodeId: removed.node._id.toString(),
      presentationId: this.slide.presentationId,
      slideId: this.slide.slideId,
      trackHistory: false,
      node: removed,
    });
    this.eventBus.next(trashEvent);
  }
  private handleRestoreNode(
    event: PresentationEvent & { nodeToRestore: ICanvasComponent },
  ) {
    this.slide.components.push(event.nodeToRestore);
    this.layer.add(event.nodeToRestore.node);
    this.layer.batchDraw();
    const unTrashEvent = new RemoveFromTrashEvents({
      ...event,
      node: event.nodeToRestore,
    });
    this.eventBus.next(unTrashEvent);
  }
}
