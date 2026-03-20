import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
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
  private mainCover!: Konva.Rect;
  @Input() slide!: Slide;
  private activeNode ?: Konva.Node;
  private isEditing:boolean = false;
  constructor(private slideService: SlideService) { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(this.activeNode && this.isEditing && this.activeNode.getClassName() == "Text")
    {
      const textNode = this.activeNode as Konva.Text;
      textNode.text("Text added")
    }
  }
  ngAfterViewInit(): void {
    const config: DocumentConfiguration = {
      ratio: { num: 16, den: 9 },
      pixelRatio: 1,
    };
    this.setUpSlide(config);
  }

  private setUpSlide(config: DocumentConfiguration): void {
    this.configureSlide(config);
    this.slideService.presentationEvents$.subscribe((event) => {
      this.addText()
    })
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
    this.stage.on('mousedown', (e) => {
      // if clicked on empty area
      if (e.target === this.mainCover) {
        this.transformer.nodes([]);
        this.layer.draw();
        return;
      }
    }
    );
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.mainCover = new Konva.Rect({
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

    this.layer.add(this.mainCover);
    this.layer.add(this.transformer);
  }

  private handleSelectNode(node: Konva.Node) {
    this.transformer.nodes([node]);
  
    const className = node.getClassName();
    switch (className) {
      case 'Text':
        this.transformer.enabledAnchors([]);
        break;
      default:
        this.transformer.enabledAnchors([
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
    this.layer.batchDraw();
  }

  addText() {
    const text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'New Text',
      fontSize: 50,
      draggable: true,
    });
    text.on('click', () => {
      this.handleSelectNode(text);
    });
    text.on("dblclick", () => {
     const { x, y } = text.getAbsolutePosition();

      const textarea = document.createElement("textarea");

      this.cont.nativeElement.appendChild(textarea);

      textarea.value = text.text();

      textarea.style.position = "absolute";
      textarea.style.left = x + "px";
      textarea.style.top = y + "px";
      textarea.style.minWidth = text.width() + 'px';
      textarea.style.height = text.height() + 'px'
      textarea.style.fontSize = text.fontSize() + "px";
      textarea.style.fontFamily = text.fontFamily();

  textarea.focus();
      // this.activeNode = text;
      // this.isEditing = true;
      // const caret = new Konva.Line({
      //   points: [0, 0, 0, text.fontSize()],
      //   stroke: 'black',
      //   strokeWidth: 1
      // });
      // caret.rotation(text.rotation());
      // caret.position(
      //   {
      //     x: text.x(),
      //     y: text.y()
      //   }
      // )
      // const anim = new Konva.Animation((frame) => {
      //   const visible = Math.floor(frame.time / 500) % 2 === 0;
      //   caret.opacity(visible ? 1 : 0);
      // }, this.layer);

      // anim.start();
      // this.layer.add(caret)
    });
    this.layer.add(text);
  }
  updateText() {

  }
}
