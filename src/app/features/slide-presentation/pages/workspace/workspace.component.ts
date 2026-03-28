import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { PresentationEventType, ShapeEvent as ShapeEvent, SlideEvent, TextEvent } from '../../domain/EventModels/presentationEvents.model';
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
        nodeId:"",
        presentationId: this.presentation.id,
        slideId: this.activeSlide!.slideId,
        currentConfig:{ attrs:{},zIndex:0},
        previousConfig:undefined,
        eventType: PresentationEventType.ADD_TEXT,
        trackHistory : true
      }
    )
    this.presentation.controller.publishEvent(textEvent)
  }
  
  addSlide() {
    this.presentation.controller.publishEvent(
      new SlideEvent({
        presentationId:this.presentation.id,
        slideId:"",
        nodeId:'',
        trackHistory:true,
        eventType:PresentationEventType.ADD_SLIDE,
      })
    )
    if(this.presentation.slides.length == 1)
    {
      this.selectSlide(this.presentation.slides[0]);
    }
  }
  
  addShape() {
    const shapeEvent: ShapeEvent = new ShapeEvent(
      {
        nodeId:'',
        presentationId: this.presentation.id,
        slideId: this.presentation.slides[0].slideId,
        shapeType: ShapeType.RECT,
        currentConfig: {attrs:{},zIndex:0},
        previousConfig:undefined,
        eventType: PresentationEventType.ADD_SHAPE,
        trackHistory:true
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
