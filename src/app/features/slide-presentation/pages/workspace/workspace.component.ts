import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { SlideService } from '../../services/slide.service';
import { PresentationEventType, TextEvent } from '../../domain/models/presentationEvents.model';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit{
  presentation!:Presentation;
  constructor(private slideService:SlideService){}
  ngOnInit(): void {
    this.presentation = new Presentation();
  }
  handleAddText()
  {
    const textEvent :TextEvent = new TextEvent(
      {
        presentationId:this.presentation.id,
        slideId:this.presentation.slides[0].slideId,
        textContent:'New Text',
        eventType:PresentationEventType.ADD_TEXT
      }
    ) 
    this.slideService.presentationEventBus(textEvent)
  }
  slideIdx:number = -1;
  getActiveSlide()
  {
    return this.presentation.slides[this.slideIdx];
  }
  addSlide(){
    const slide = this.slideService.getSlide();
    this.slideIdx++;
    this.presentation.slides.push(slide);
  }

}
