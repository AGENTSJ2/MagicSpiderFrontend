import { Shape } from 'konva/lib/Shape';
import { Layer } from 'konva/lib/Layer';
import { Rect } from 'konva/lib/shapes/Rect';
import { Transformer } from 'konva/lib/shapes/Transformer';
import { Stage } from 'konva/lib/Stage';
import { DocumentConfiguration } from '../domain/models/documentConfiguration.model';
import { ICanvasComponent } from '../domain/canvasModels/ICanvasComponent';
import { PresentationEventStream } from '../domain/EventModels/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';
import { waitForMilliseconds } from '../../../core/utilities';

export default class SlideController {
  transformer!: Transformer;
  layer!: Layer;
  mainCover!: Rect;
  stage!: Stage;
  private slide: Slide;
  private readonly DESIRED_SLIDE_HEIGHT = 750;
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
    this.slide = init.slide;
    this.setUp();
    this.registerEvents();
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
        return;
      }
    });
  }
  resizeInProgress: boolean = true;
  triggerResize(options: {
    divElm: HTMLDivElement;
    config: DocumentConfiguration;
  }) {
    try {
      this.resizeInProgress = true;
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
    } catch (error) {
    } finally {
      this.resizeInProgress = false;
    }
  }

  isNodeSelected(node: Shape): boolean {
    return this.transformer.nodes().some((nd) => nd == node);
  }

  selectComponent(node: Shape, options?: { anchors: string[] }) {
    this.transformer.moveToTop(); // always move to top
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
    this.selectComponent(node.node);
  }

  destroy() {
    this.transformer.destroy();
  }

  async getStageSnapShot() {
    const maxAttempts = 1000;
    let attempt = 10;
    console.log("he");
    
    while (maxAttempts > attempt) {
      if (!this.resizeInProgress) {
        return this.stage?.toDataURL();
      }
      attempt++;
      await waitForMilliseconds(100);
    }
    return this.stage?.toDataURL();
  }
}
