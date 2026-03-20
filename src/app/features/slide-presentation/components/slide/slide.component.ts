import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { DocumentConfiguration } from '../../domain/models/documentConfiguration.model';
import { SlideService } from '../../services/slide.service';
import { Slide } from '../../domain/models/slide.model';
import { TextEvent } from '../../domain/models/presentationEvents.model';
import TextController from '../../domain/controllers/textController.model';
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
  constructor(private slideService: SlideService) { }

  ngAfterViewInit(): void {
    // 16 : 9 (normal slide ratio)
    const config: DocumentConfiguration = {
      ratio: { num: 16, den: 9 },
      pixelRatio: 1,
    };
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.slideService.resizeSlide(this.slide, { divElm: this.cont.nativeElement, config: config });
      }
    });
    this.observer.observe(this.cont.nativeElement);
    this.listenToPresentationEvents();
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  private listenToPresentationEvents() {
    this.slideService.presentationEvents$.subscribe((event) => {
      if (event instanceof TextEvent) {
        this.addText(event.textContent);
        return;
      }
    })
  }

  private handleSelectNode(node: Konva.Node) {
    this.slide.transformer.nodes([node]);

    const className = node.getClassName();
    switch (className) {
      case 'Text':
        this.slide.transformer.enabledAnchors([]);
        break;
      default:
        this.slide.transformer.enabledAnchors([
          'top-left',
          'top-center',
          'top-right',
          'middle-left',
          'middle-right',
          'bottom-left',
          'bottom-center',
          'bottom-right',
        ]);
    }
    this.slide.layer.batchDraw();
  }

  addText(textContent: string) {

    const temp = new TextController({
      slide: this.slide,
      containerDiv: this.cont.nativeElement,
      content: textContent
    })

  }
}
