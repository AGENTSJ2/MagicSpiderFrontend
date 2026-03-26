import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DocumentConfiguration } from '../../domain/models/documentConfiguration.model';
import { SlideService } from '../../services/slide.service';
import { Slide } from '../../domain/canvasModels/slide.model';
import { ShapeEvent, TextEvent } from '../../domain/models/presentationEvents.model';
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
  private slideEventSubscription!: Subscription;
  constructor(private slideService: SlideService) { }
  
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
    this.listenToPresentationEvents();
  }

  ngOnDestroy() {
    this.observer.disconnect();
    this.slideEventSubscription?.unsubscribe();
  }

  private listenToPresentationEvents() {
    this.slideEventSubscription = this.slideService.presentationEvents$.subscribe((event) => {

      if (event instanceof TextEvent) {
        this.addText(event.textContent);
        return;
      }
      if (event instanceof ShapeEvent) {
        this.addShape(event.shapeType);
      }
    })
  }

  addText(textContent: string) {
    const text = new TextComponent({
      slide: this.slide,
      containerDiv: this.cont.nativeElement,
      textContent: textContent,
    })
    this.slide.controller.addComponent(text);
  }
  addShape(shapeType: ShapeType) {
    const shape = new ShapeComponent({
      slide: this.slide,
      containerDiv: this.cont.nativeElement,
      shapeType: shapeType,
    })
    this.slide.controller.addComponent(shape);
  }
}
