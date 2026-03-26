import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { SlideService } from '../../services/slide.service';
import { PresentationEventType, ShapeEvent as ShapeEvent, TextEvent } from '../../domain/models/presentationEvents.model';
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
  constructor(private slideService: SlideService) { }
  ngOnInit(): void {
    this.presentation = new Presentation();
    this.addSlide(); // TODO REMOVE
  }
  handleAddText() {
    const textEvent: TextEvent = new TextEvent(
      {
        presentationId: this.presentation.id,
        slideId: this.presentation.slides[0].slideId,
        textContent: 'New Text',
        eventType: PresentationEventType.ADD_TEXT
      }
    )
    this.slideService.presentationEventBus(textEvent)
  }
  addSlide() {
    const slide = this.slideService.getSlide();
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
    this.slideService.presentationEventBus(shapeEvent);
  }
  selectSlide(slide:Slide)
  {
    this.activeSlide = undefined;
    setTimeout(()=>{
      this.activeSlide = slide;
    })
    
  }
}
