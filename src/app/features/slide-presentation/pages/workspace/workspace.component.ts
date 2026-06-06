import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { PresentationEvent } from '../../domain/EventModels/presentationEvents.model';
import { LLM_Agents } from '../../../../services/agents';
import { WorkspaceController } from './workspace.controller';
import { PresentationService } from '../../../../services/konva.services/presentation.service';
import { ActivatedRoute } from '@angular/router';

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
    private presentationService: PresentationService,
    private route: ActivatedRoute,
  ) {
    const id = this.route.snapshot.queryParamMap.get('id');
    if(id)
    {
      this.presentation = presentationService.getPresentation(id);
      const firstSlide = this.presentation.slides.at(0);
      console.log(firstSlide);
      if(firstSlide)
      {
        this.selectSlide(firstSlide)
      }
    }
  }

  ngOnInit(): void {
    if(!this.presentation)
    {
      this.presentation = new Presentation();
      for (let index = 0; index < 1; index++) {
        this.addSlide(); // TODO REMOVE
      }
    }
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
    // this.presentation.publishEvent(event);
  }

  private listenPresentationEvents() {
    const listener = this.presentation.listenEvent();
  }

  handleRemoveSlide(item: Slide, event: Event) {
    event.stopImmediatePropagation();
    this.presentation.removeSlide(item);
  }
  handleOpenAiDescription() {
    this.workSpaceController.showSlideDescription = true;
  }
  showMagicAssistant(state: boolean) {
    this.workSpaceController.showMagicSpiderAssistant = state;
  }
  savePpt() {
    this.presentationService.savePresentation(this.presentation);
  }
}
enum ToolBoxType {
  TextToolBox,
  ImageToolBox,
  ShapeTooLBox,
  None,
}
