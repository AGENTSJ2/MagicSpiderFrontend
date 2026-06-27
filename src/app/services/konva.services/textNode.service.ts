import { TextComponent } from '../../features/slide-presentation/domain/canvasModels/textComponent.model';
import {
  ComponentConfig,
  PresentationEventStream,
  ZIndexActions,
} from '../../features/slide-presentation/domain/EventModels/presentationEvents.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import { Text, TextConfig } from 'konva/lib/shapes/Text';

@Injectable({
  providedIn: 'root',
})
export class TextNodeService {
  addTextNode(params: {
    eventBus: PresentationEventStream;
    slide: Slide;
    config: ComponentConfig<TextConfig>;
  }) {
    const component = new TextComponent({
      slide: params.slide,
      config: params.config,
      eventBus: params.eventBus,
    });
    params.slide.controller.addComponent(component);
    return component;
  }
  updateTextNode(params: {
    node: Text;
    zIndexActions?: ZIndexActions;
    config: ComponentConfig<TextConfig>;
  }) :Text | undefined {
    params.node.setAttrs(params.config.attrs);
    params.node.zIndex(params.config.zIndex);
    if (params?.zIndexActions != undefined) {
      switch (params.zIndexActions) {
        case ZIndexActions.moveToFront:
          params.node.moveToTop();
          break;
        case ZIndexActions.moveToBack:
          params.node.moveToBottom();
          break;
        case ZIndexActions.moveDown:
          params.node.moveDown();
          break;
        case ZIndexActions.moveUp:
          params.node.moveUp();
          break;
      }
    }
    return params.node;
  }
}

export const textNodeService = new TextNodeService();
