import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent implements AfterViewInit {
  @ViewChild('slide',{static:false})
  cont!:ElementRef<HTMLDivElement>

  ngAfterViewInit(): void {
    console.log(this.cont.nativeElement.offsetWidth);
    
    const containerWidth = this.cont.nativeElement.offsetWidth;
    const containerHeight = this.cont.nativeElement.offsetWidth*(9/16);
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
      fill: 'green',
      stroke: 'black',
      strokeWidth: 1,
    });
    layer.add(rect1);
  }
}
