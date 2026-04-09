import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { AddTextEvent, SelectTextEvent, TextEvent } from '../../domain/EventModels/textEvent.model';
import { AddSlideEvent } from '../../domain/EventModels/slideEvent.model';
import { AddShapeEvent, ShapeEvent } from '../../domain/EventModels/shapeEvent.models';
import { PresentationEvent } from '../../domain/EventModels/presentationEvents.model';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit {
  presentation!: Presentation;
  activeSlide?: Slide;
  TooBoxType = ToolBoxType;
  constructor() { }

  ngOnInit(): void {
    this.presentation = new Presentation();
    this.addSlide(); // TODO REMOVE
    this.listenPresentationEvents();
  }

  selectedToolBox:ToolBoxType = ToolBoxType.None;
  event?:PresentationEvent;
  listenPresentationEvents()
  {
    const listener = this.presentation.listenEvent();
    listener.subscribe((event)=>{
      if(event instanceof SelectTextEvent)
      {
        this.selectedToolBox = ToolBoxType.TextToolBox;
        this.event = event;
      }
    });
  }
  handleAddText() {
    const textEvent: TextEvent = new AddTextEvent(
      {
        nodeId: "",
        presentationId: this.presentation.id,
        slideId: this.activeSlide!.slideId,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: undefined,
        trackHistory: true
      }
    )
    this.presentation.publishEvent(textEvent)
  }

  addSlide() {
    const slideEvent = new AddSlideEvent({
      presentationId: this.presentation.id,
      slideId: "",
      nodeId: '',
      trackHistory: true,
      
    });
    this.presentation.publishEvent(
      slideEvent
    )
    if (this.presentation.slides.length == 1) {
      this.selectSlide(this.presentation.slides[0]);
    }
  }

  addShape() {
    const shapeEvent: ShapeEvent = new AddShapeEvent(
      {
        nodeId: '',
        presentationId: this.presentation.id,
        slideId: this.presentation.slides[0].slideId,
        shapeType: ShapeType.RECT,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: undefined,
        trackHistory: true
      }
    );
    this.presentation.publishEvent(shapeEvent);
  }

  selectSlide(slide: Slide) {
    this.activeSlide = undefined;
    setTimeout(() => {
      this.activeSlide = slide;
    })
  }
  handleUpdate(event:any)
  {
    this.presentation.publishEvent(event)
  }
}
enum ToolBoxType {
  TextToolBox,
  ImageToolBox,
  ShapeTooLBox,
  None
}