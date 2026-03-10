import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';
import { DocumentConfiguration } from '../../models/documentConfiguration.model';
import { SlideService } from '../../services/slide.service';
import { Slide } from '../../models/slide.model';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.scss',
})
export class SlideComponent implements AfterViewInit {
  @ViewChild('slide', { static: false })
  cont!: ElementRef<HTMLDivElement>;
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private transformer!: Konva.Transformer;
  @Input() slide!:Slide;
  constructor(private slideService:SlideService) {}

  ngAfterViewInit(): void {
    const config: DocumentConfiguration = {
      ratio: { num: 16, den: 9 },
      pixelRatio: 1,
    };
    this.setUpSlide(config);
    this.slideService.presentationEvents$.subscribe((event)=>{
      this.addText()
    })
  }

  private setUpSlide(config: DocumentConfiguration): void {
    this.configureSlide(config);
  }

  private configureSlide(config: DocumentConfiguration): void {
    const containerWidth = this.cont.nativeElement.offsetWidth;
    const containerHeight =
      this.cont.nativeElement.offsetWidth *
      (config.ratio.den / config.ratio.num);

    this.stage = new Konva.Stage({
      container: this.cont.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    const mainCover = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.stage.width(),
      height: this.stage.height(),
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1,
    });

    this.transformer = new Konva.Transformer({
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
      centeredScaling: false,
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

    this.layer.add(mainCover);
    this.layer.add(this.transformer);
  }

  addText() {
    const text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'New Text',
      fontSize: 30,
      draggable: true,
    });
    text.on('click', () => {
      this.transformer.nodes([text]);
      this.layer.batchDraw();
    });
    this.layer.add(text);
  }
  updateText()
  {
    
  }
}
