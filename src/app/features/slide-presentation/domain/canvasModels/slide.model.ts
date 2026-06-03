import SlideController from '../../controllers/slide.controller';
import { Shape } from 'konva/lib/Shape';
import { PresentationEventStream } from '../EventModels/presentationEvents.model';
import { ICanvasComponent } from './ICanvasComponent';

export class Slide {
  slideId: string;
  presentationId: string;
  components: ICanvasComponent[];
  readonly controller: SlideController;
  containerDiv!: HTMLDivElement;

  constructor(init: Partial<Slide> & { eventBus: PresentationEventStream }) {
    this.slideId = init.slideId!;
    this.presentationId = init.presentationId!;
    this.components = init.components ?? [];
    this.controller = new SlideController({
      eventBus: init.eventBus,
      slide: this,
    });
  }

  destroy() {
    this.controller.destroy();
  }

  toJson() {
    const json = {
      slideId: this.slideId,
      presentationId: this.presentationId,
      components: this.components.map((cm) => {
        cm.node.id(cm.node._id.toString())
        return {
          node: JSON.parse(cm.node.toJSON()),
        };
      }),
    };
    return json;
  }
}
