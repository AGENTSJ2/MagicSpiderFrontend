import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DocumentConfiguration } from '../../domain/models/documentConfiguration.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { ShapeEvent, TextEvent } from '../../domain/EventModels/presentationEvents.model';
import { TextComponent } from '../../domain/canvasModels/textComponent.model';
import ShapeComponent, { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.scss',
})
export class SlideComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slide', { static: false })
  cont!: ElementRef<HTMLDivElement>;
  @Input() slide!: Slide;
  private observer!: ResizeObserver;
  constructor() { }
  
  ngAfterViewInit(): void {
    // 16 : 9 (normal slide ratio)
    const config: DocumentConfiguration = {
      ratio: { num: 16, den: 9 },
      pixelRatio: 1,
    };
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.slide.controller.triggerResize({ divElm: this.cont.nativeElement, config: config });
      }
    });
    this.observer.observe(this.cont.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
