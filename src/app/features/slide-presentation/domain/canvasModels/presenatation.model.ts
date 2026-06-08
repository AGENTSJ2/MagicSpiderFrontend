import { ShapeConfig } from 'konva/lib/Shape';
import { PresentationController } from '../../controllers/presentation.controller';
import {
  ComponentConfig,
  PresentationEvent,
  PresentationEventStream,
  PresentationEventType,
} from '../EventModels/presentationEvents.model';
import { DocumentConfiguration } from '../models/documentConfiguration.model';
import { ICanvasComponent } from './ICanvasComponent';
import { Slide } from './slide.model';

export class Presentation {
  id: string;
  name:string;
  slides: Slide[];
  config: DocumentConfiguration;
  private _activeSlide?:Slide;

  get getActiveSlide()
  {
    return this._activeSlide;
  }

  set setActiveSlide(v:Slide | undefined)
  {
    this._activeSlide?.controller.clearSelections();
    this._activeSlide = v
  }

  readonly controller: PresentationController = new PresentationController(
    this,
  );
  readonly eventBus: PresentationEventStream;
  constructor(init?: Partial<Presentation>) {
    this.name = init?.name ?? 'Untitled Presentation'
    this.id = init?.id ?? crypto.randomUUID();
    this.slides = init?.slides ?? [];
    this.config = init?.config ?? { ratio: { num: 16, den: 9 }, pixelRatio: 1 };
    this.eventBus = this.controller.eventBus;
  }
  listenEvent() {
    return this.controller.listen();
  }

  emitEvent(params: {
    slide: Slide;
    component: ICanvasComponent;
    eventType: PresentationEventType;
    newConfig: ComponentConfig<ShapeConfig> | undefined;
    oldConfig?: ComponentConfig<ShapeConfig>;
    trackHistory?:boolean;
  }) {
    const trackHistory = params.trackHistory == undefined || params.trackHistory;
    const newConfig =  structuredClone(params.newConfig);
    const oldConfig = structuredClone(params.oldConfig);
    const event: PresentationEvent = new PresentationEvent({
      eventType: params.eventType,
      nodeId: params.component.node._id.toString(),
      currentConfig: newConfig,
      previousConfig: oldConfig,
      trackHistory: trackHistory,
      presentationId: this.id,
      slideId: params?.slide?.slideId,
    });
    this.eventBus.next(event);
  }

  // emitPresentationEvent(params:{
  //   trackHistory:boolean,
  //   slideId:string,
  //   nodeId:string
  // })
  // {
  //   this.eventBus.next({
  //     trackHistory:params.trackHistory,
  //     presentationId:this.id,
  //     slideId:params.slideId,
  //     previousConfig:undefined,
  //     currentConfig:undefined,
  //     nodeId:params.nodeId,
  //     eventType:PresentationEventType
  //   })
  // }
  addSlide() {
    const ConfiguredSlide = new Slide({
      presentation: this,
      components: [],
      eventBus: this.eventBus,
    });
    this.slides.push(ConfiguredSlide);
    return ConfiguredSlide;
  }

  removeSlide(slide: Slide) {
    const slideIdx = this.slides.findIndex((sl) => sl.slideId == slide.slideId);
    if (slideIdx < 0) {
      throw new Error('No Slide of this id is found');
    }
    this.slides.splice(slideIdx, 1);
    slide?.destroy();
    return slide;
  }
}
// export 
