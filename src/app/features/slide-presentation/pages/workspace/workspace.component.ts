import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { AddTextEvent, RemoveTextEvent, SelectTextEvent, TextEvent, UpdateTextEvent } from '../../domain/EventModels/textEvent.model';
import { AddSlideEvent, RemoveSlideEvent } from '../../domain/EventModels/slideEvent.model';
import { AddShapeEvent, RemoveShapeEvent, SelectShapeEvent, ShapeEvent, UpdateShapeEvent } from '../../domain/EventModels/shapeEvent.models';
import { AddImageEvent, ImageEvent, RemoveImageEvent, SelectImageEvent, UpdateImageEvent } from '../../domain/EventModels/imageEvent.model';
import { ClearSelectionEvent, PresentationEvent } from '../../domain/EventModels/presentationEvents.model';
import { LLM_Agents } from '../../../../services/agents';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit {
  presentation!: Presentation;
  activeSlide?: Slide;
  TooBoxType = ToolBoxType;
  ShapeType = ShapeType;
  constructor(private agentsService : LLM_Agents) { }

  ngOnInit(): void {
    this.presentation = new Presentation();
    this.addSlide(); // TODO REMOVE
    this.listenPresentationEvents();
  }

  selectedToolBox: ToolBoxType = ToolBoxType.None;
  activeEvent?: PresentationEvent;
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

  addShape(shapeType: ShapeType) {
    const shapeEvent: ShapeEvent = new AddShapeEvent(
      {
        nodeId: '',
        presentationId: this.presentation.id,
        slideId: this.presentation.slides[0].slideId,
        shapeType: shapeType,
        currentConfig: { attrs: {}, zIndex: 0 },
        previousConfig: undefined,
        trackHistory: true
      }
    );
    this.presentation.publishEvent(shapeEvent);
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.activeSlide) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageEvent: ImageEvent = new AddImageEvent({
        nodeId: '',
        presentationId: this.presentation.id,
        slideId: this.activeSlide!.slideId,
        currentConfig: {
          attrs: {
            imageSrc: reader.result as string,
          },
          zIndex: 0,
        },
        previousConfig: undefined,
        trackHistory: true
      });
      this.presentation.publishEvent(imageEvent);
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  selectSlide(slide: Slide) {
    this.activeSlide = undefined;
    setTimeout(() => {
      this.activeSlide = slide;
    })
  }

  handleUpdate(event: any) {
    this.presentation.publishEvent(event)
  }

  private listenPresentationEvents() {
    const listener = this.presentation.listenEvent();
    listener.subscribe((event) => {
      if (event instanceof ClearSelectionEvent) {
        this.activeEvent = undefined;
        this.selectedToolBox = ToolBoxType.None;
        return;
      }
      if (event instanceof TextEvent) {
        this.handleTextSpecificEvents(event);
        return;
      }
      if (event instanceof ShapeEvent) {
        this.handleShapeSpecificEvents(event);
        return;
      }
      if (event instanceof ImageEvent) {
        this.handleImageSpecificEvents(event);
        return;
      }
    });
  }

  private handleTextSpecificEvents(event: TextEvent) {
    if (event instanceof SelectTextEvent) {
      this.selectedToolBox = ToolBoxType.TextToolBox;
      this.activeEvent = event;
    }
    if (event instanceof RemoveTextEvent) {
      if (this.activeEvent?.nodeId == event.nodeId) {
        this.selectedToolBox = ToolBoxType.None;
      }
    }
    if (event instanceof UpdateTextEvent && (this.activeEvent?.nodeId == event.nodeId)) {
      this.activeEvent = event;
    }
  }

  private handleShapeSpecificEvents(event: ShapeEvent) {
    if (event instanceof SelectShapeEvent) {
      this.selectedToolBox = ToolBoxType.ShapeTooLBox;
      this.activeEvent = event;
    }
    if (event instanceof RemoveShapeEvent) {
      if (this.activeEvent?.nodeId == event.nodeId) {
        this.selectedToolBox = ToolBoxType.None;
      }
    }
    if (event instanceof UpdateShapeEvent && (this.activeEvent?.nodeId == event.nodeId)) {
      this.activeEvent = event;
    }
  }

  private handleImageSpecificEvents(event: ImageEvent) {
    if (event instanceof SelectImageEvent) {
      this.selectedToolBox = ToolBoxType.ImageToolBox;
      this.activeEvent = event;
    }
    if (event instanceof RemoveImageEvent) {
      if (this.activeEvent?.nodeId == event.nodeId) {
        this.selectedToolBox = ToolBoxType.None;
      }
    }
    if (event instanceof UpdateImageEvent && (this.activeEvent?.nodeId == event.nodeId)) {
      this.activeEvent = event;
    }
  }

  handleRemoveSlide(item:Slide)
  {
    this.presentation.publishEvent(
      new RemoveSlideEvent({
        slideId:item.slideId,
        nodeId:item.slideId,
        presentationId:this.presentation.id,
        trackHistory:false
      })
    )
  }
  isVisible:boolean = false;
  handleTest() {
    this.isVisible = true;
  }
}
enum ToolBoxType {
  TextToolBox,
  ImageToolBox,
  ShapeTooLBox,
  None
}
