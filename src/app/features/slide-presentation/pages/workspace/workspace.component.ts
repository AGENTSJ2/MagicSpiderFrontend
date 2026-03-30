import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeEvent as ShapeEvent, SlideEvent } from '../../domain/EventModels/presentationEvents.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { AddTextEvent, TextEvent } from '../../domain/EventModels/textEvent.model';
import { AddSlideEvent } from '../../domain/EventModels/slideEvent.model';
import { AddShapeEvent } from '../../domain/EventModels/shapeEvent.models';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit {
  presentation!: Presentation;
  activeSlide?: Slide;

  constructor() { }

  ngOnInit(): void {
    this.presentation = new Presentation();
    this.addSlide(); // TODO REMOVE
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
    this.presentation.controller.publishEvent(textEvent)
  }

  addSlide() {
    const slideEvent = new AddSlideEvent({
      presentationId: this.presentation.id,
      slideId: "",
      nodeId: '',
      trackHistory: true,
      
    });
    this.presentation.controller.publishEvent(
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
    this.presentation.controller.publishEvent(shapeEvent);
  }

  selectSlide(slide: Slide) {
    this.activeSlide = undefined;
    setTimeout(() => {
      this.activeSlide = slide;
    })
  }

}
