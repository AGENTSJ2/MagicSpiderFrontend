import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { PresentationEventType, ShapeEvent as ShapeEvent, TextEvent } from '../../domain/EventModels/presentationEvents.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit {
  presentation!: Presentation;
  activeSlide?:Slide;
  constructor() { }
  ngOnInit(): void {
    this.presentation = new Presentation();
    this.addSlide(); // TODO REMOVE
  }
  handleAddText() {
    const textEvent: TextEvent = new TextEvent(
      {
        presentationId: this.presentation.id,
        slideId: this.presentation.slides[0].slideId,
        currentConfig:{
          text:"New Text"
        },
        previousConfig:undefined,
        eventType: PresentationEventType.ADD_TEXT
      }
    )
    this.presentation.controller.publishEvent(textEvent)
  }
  addSlide() {
    const slide = this.presentation.controller.addSlide();
    this.presentation.slides.push(slide);
    this.selectSlide(slide);
  }
  addShape() {
    const shapeEvent: ShapeEvent = new ShapeEvent(
      {
        presentationId: this.presentation.id,
        slideId: this.presentation.slides[0].slideId,
        shapeType: ShapeType.RECT,
        eventType: PresentationEventType.ADD_SHAPE
      }
    );
    this.presentation.controller.publishEvent(shapeEvent);
  }
  selectSlide(slide:Slide)
  {
    this.activeSlide = undefined;
    setTimeout(()=>{
      this.activeSlide = slide;
    })
    
  }
}
