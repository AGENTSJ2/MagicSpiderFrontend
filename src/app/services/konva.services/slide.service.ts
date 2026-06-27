import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import { Presentation } from '../../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SlideService {
  addSlide(params: { presentation: Presentation }): Slide {
    const ConfiguredSlide = new Slide({
      presentation: params.presentation,
      components: [],
      eventBus: params.presentation.eventBus,
    });
    params.presentation.slides.push(ConfiguredSlide);
    return ConfiguredSlide;
  }
  removeSlide(params: { presentation: Presentation; slideId: string }): Slide {
    const slideIdx = params.presentation.slides.findIndex(
      (sl) => sl.slideId == params.slideId,
    );
    if (slideIdx < 0) {
      throw new Error('No Slide of this id is found');
    }
    const slide = params.presentation.slides.at(slideIdx)!;
    params.presentation.slides.splice(slideIdx, 1);
    slide?.destroy();
    return slide;
  }
  getSlideById(params: { slideId: string; presentation: Presentation }) {
    const slide = params.presentation.slides.find(
      (sl) => sl.slideId == params.slideId,
    );
    return slide;
  }
}

export const slideService = new SlideService();
