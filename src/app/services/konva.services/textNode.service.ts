import { Injectable } from '@angular/core';
import { TextComponent } from '../../features/slide-presentation/domain/canvasModels/textComponent.model';
import {
  ComponentConfig,
  PresentationEventStream,
} from '../../features/slide-presentation/domain/EventModels/presentationEvents.model';
import { SerializableImageConfig } from '../../features/slide-presentation/domain/EventModels/imageEvent.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';

@Injectable({
  providedIn: 'root',
})
export class TextNodeService {
  addTextNode(params: {
    eventBus: PresentationEventStream;
    slide: Slide;
    config: ComponentConfig<SerializableImageConfig>;
  }) {
    const component = new TextComponent({
      slide: params.slide,
      config: params.config,
      eventBus: params.eventBus,
    });
    params.slide.controller.addComponent(component);
    return component;
  }
}
