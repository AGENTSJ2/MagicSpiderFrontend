import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import {
  RemoveTextEvent,
  SelectTextEvent,
  TextEvent,
  UpdateTextEvent,
} from '../../domain/EventModels/textEvent.model';
import { RemoveSlideEvent } from '../../domain/EventModels/slideEvent.model';
import {
  RemoveShapeEvent,
  SelectShapeEvent,
  ShapeEvent,
  UpdateShapeEvent,
} from '../../domain/EventModels/shapeEvent.models';
import {
  AddImageEvent,
  ImageEvent,
  RemoveImageEvent,
  SelectImageEvent,
  UpdateImageEvent,
} from '../../domain/EventModels/imageEvent.model';
import {
  ClearSelectionEvent,
  PresentationEvent,
} from '../../domain/EventModels/presentationEvents.model';
import { LLM_Agents } from '../../../../services/agents';
import { WorkspaceController } from './workspace.controller';
import { ShapeNodeService } from '../../../../services/konva.services/shapeNode.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  presentation!: Presentation;
  activeSlide?: Slide;
  TooBoxType = ToolBoxType;
  ShapeType = ShapeType;
  constructor(
    private agentsService: LLM_Agents,
    public workSpaceController: WorkspaceController,
    private shapeService: ShapeNodeService,
  ) {}

  ngOnInit(): void {
    this.presentation = new Presentation();
    this.addSlide(); // TODO REMOVE
    this.listenPresentationEvents();
  }

  selectedToolBox: ToolBoxType = ToolBoxType.None;
  activeEvent?: PresentationEvent;
  handleAddText() {
    this.activeSlide?.addText({});
  }

  addSlide() {
    const slide = this.presentation.addSlide();
    this.selectSlide(slide);
  }

  addShape(shapeType: ShapeType) {
    this.activeSlide?.addShape({ shapeType: shapeType });
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.activeSlide) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.activeSlide?.addImage({
        config: {
          attrs: {
            imageSrc: reader.result as string,
          },
          zIndex: 0,
        },
      });
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  selectSlide(slide: Slide) {
    this.activeSlide = undefined;
    setTimeout(() => {
      this.activeSlide = slide;
    });
  }

  handleUpdate(event: any) {
    this.presentation.publishEvent(event);
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
    if (
      event instanceof UpdateTextEvent &&
      this.activeEvent?.nodeId == event.nodeId
    ) {
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
    if (
      event instanceof UpdateShapeEvent &&
      this.activeEvent?.nodeId == event.nodeId
    ) {
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
    if (
      event instanceof UpdateImageEvent &&
      this.activeEvent?.nodeId == event.nodeId
    ) {
      this.activeEvent = event;
    }
  }

  handleRemoveSlide(item: Slide) {
    this.presentation.removeSlide(item);
  }
  handleOpenAiDescription() {
    this.workSpaceController.showSlideDescription = true;
  }
  showMagicAssistant(state:boolean) {
    this.workSpaceController.showMagicSpiderAssistant = state;
  }
}
enum ToolBoxType {
  TextToolBox,
  ImageToolBox,
  ShapeTooLBox,
  None,
}
