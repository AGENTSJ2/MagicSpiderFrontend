import { Injectable } from '@angular/core';
import ShapeComponent, { ShapeType } from '../../features/slide-presentation/domain/canvasModels/shapeComponent.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import { ComponentConfig, PresentationEventStream } from '../../features/slide-presentation/domain/EventModels/presentationEvents.model';
import { SerializableImageConfig } from '../../features/slide-presentation/domain/EventModels/imageEvent.model';

@Injectable({
  providedIn: 'root',
})
export class ShapeNodeService {
  addShapeNode(params: {
    eventBus: PresentationEventStream;
    slide: Slide;
    config: ComponentConfig<SerializableImageConfig>;
    shapeType:ShapeType
  }) {
    const component = new ShapeComponent({
      slide: params.slide,
      config: params.config,
      shapeType: params.shapeType,
      eventBus: params.eventBus,
    });
    params.slide.controller.addComponent(component);
    return component;
  }
}
