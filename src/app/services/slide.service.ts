import { Injectable } from '@angular/core';
import { Slide } from '../features/slide-presentation/domain/canvasModels/slide.model';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';

@Injectable({
  providedIn: 'root',
})
export class SlideService {
  addSlide(params: { presentation: Presentation }): Slide {
    const slide: Partial<Slide> = {
      presentationId: params.presentation.id,
      slideId: crypto.randomUUID().toString(),
      components: [],
    };
    const ConfiguredSlide = new Slide({
      ...slide,
      eventBus: params.presentation.eventBus,
    });
    params.presentation.slides.push(ConfiguredSlide);
    return ConfiguredSlide;
  }
}
