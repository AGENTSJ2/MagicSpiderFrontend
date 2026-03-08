import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.scss',
})
export class SlideComponent implements AfterViewInit{
  @ViewChild('slide', { static: false })
  cont!: ElementRef<HTMLDivElement>;
  constructor(){
    Konva.pixelRatio = 1;
  }
  ngAfterViewInit(): void {
    const containerWidth = this.cont.nativeElement.offsetWidth;
    const containerHeight = this.cont.nativeElement.offsetWidth * (9 / 16);
    const stage = new Konva.Stage({
      container: this.cont.nativeElement,
      width: containerWidth,
      height: containerHeight,
      
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    const rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1,
    });
    layer.add(rect1);
  }
}
