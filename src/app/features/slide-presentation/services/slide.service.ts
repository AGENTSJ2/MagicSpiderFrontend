import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PresentationEvent } from '../domain/models/presentationEvents.model';
import { Slide } from '../domain/canvasModels/slide.model';

@Injectable({ providedIn: 'root' })
export class SlideService {
  private presentationEvent: Subject<PresentationEvent> = new Subject();
  presentationEvents$ = this.presentationEvent.asObservable();
  private eventHistory: PresentationEvent[] = [];

  presentationEventBus(event: PresentationEvent) {
    this.eventHistory.push(event);
    this.presentationEvent.next(event);
  }

  getSlide(): Slide {
    const slide: Partial<Slide> = {
      slideId: crypto.randomUUID().toString(),
      components: [],
    };
    const ConfiguredSlide = new Slide(slide);
    return ConfiguredSlide;
  }
  
}
