import { Component, Inject, Injectable } from '@angular/core';
import { ImageComponent } from '../../features/slide-presentation/domain/canvasModels/imageComponent';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import { ComponentConfig, PresentationEventStream } from '../../features/slide-presentation/domain/EventModels/presentationEvents.model';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { Presentation } from '../../features/slide-presentation/domain/canvasModels/presenatation.model';
import { SerializableImageConfig } from '../../features/slide-presentation/domain/EventModels/imageEvent.model';

@Injectable({
  providedIn: 'root',
})
export class ImageNodeService {
  addImageNode(params: {
    eventBus: PresentationEventStream;
    slide: Slide;
    config: ComponentConfig<SerializableImageConfig>;
  }) {
    const component = new ImageComponent({
      slide: params.slide,
      config: params.config,
      eventBus: params.eventBus,
    });
    params.slide.controller.addComponent(component);
    return component;
  }
}
