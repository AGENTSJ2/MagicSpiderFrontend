import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PresentationEvent } from '../domain/models/presentationEvents.model';
import Konva from 'konva';
import { Slide } from '../domain/models/slide.model';
import { DocumentConfiguration } from '../domain/models/documentConfiguration.model';

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
    slide.stage = new Konva.Stage({
      container: document.createElement('div'),
      width: 100,
      height: 100,
    });
    slide.layer = new Konva.Layer();
    slide.transformer = new Konva.Transformer({
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
      centeredScaling: true,
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

    slide.stage.on('mousedown', (e) => {
      // if clicked on empty area
      if (e.target === slide.mainCover) {
        slide.transformer?.nodes([]);
        slide.layer?.batchDraw();
        return;
      }
    }
    );

    slide.stage.add(slide.layer);
    slide.mainCover = new Konva.Rect({
      x: 0,
      y: 0,
      width: slide.stage.width(),
      height: slide.stage.height(),
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1,
    });
    slide.layer.add(slide.mainCover);
    slide.layer.add(slide.transformer);
    return slide as Slide;
  }
  resizeSlide(slide: Slide, options: { divElm: HTMLDivElement, config: DocumentConfiguration }) {
    const containerWidth = options.divElm.offsetWidth;
    const containerHeight =
      options.divElm.offsetWidth *
      (options.config.ratio.den / options.config.ratio.num);

    slide.stage.container(options.divElm);
    slide.stage.height(containerHeight);
    slide.stage.width(containerWidth);
    slide.mainCover.height(containerHeight);
    slide.mainCover.width(containerWidth);
    slide.layer.batchDraw()
    slide.stage.draw();
  }
}
