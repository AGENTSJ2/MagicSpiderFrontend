import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { PresentationEvent } from '../../domain/EventModels/presentationEvents.model';
import { LLM_Agents } from '../../../../services/agents';
import { WorkspaceController } from './workspace.controller';
import { PresentationService } from '../../../../services/konva.services/presentation.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  presentation!: Presentation;
  TooBoxType = ToolBoxType;
  ShapeType = ShapeType;
  name: string = '';
  slideImages: Map<string, string> = new Map();
  constructor(
    private agentsService: LLM_Agents,
    public workSpaceController: WorkspaceController,
    private presentationService: PresentationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id === 'new') {
      this.router.navigate(['/workspace/ppt', this.presentation.id], {
        replaceUrl: true,
      });
      return;
    }
    this.setUpPresentation(id!);
  }

  ngOnInit(): void {}

  async setUpPresentation(presentationId: string) {
    this.presentation =
      this.presentationService.getPresentation(presentationId);
    this.name = this.presentation.name;
    this.workSpaceController.setActivePresentation = this.presentation;
    const firstSlide = this.presentation.slides.at(0);
    this.listenPresentationEvents();
    if (firstSlide) {
      this.selectSlide(firstSlide);
    }

    // for (let slide of this.presentation.slides) {
    //   const image = await slide.getLatestSlideImage();
    //   this.slideImages.set(slide.slideId, image);
    // }
    console.log(this.slideImages);
  }
  selectedToolBox: ToolBoxType = ToolBoxType.None;
  activeEvent?: PresentationEvent;
  handleAddText() {
    this.presentation.getActiveSlide?.addText({});
  }

  addSlide() {
    const slide = this.presentation.addSlide();
    this.selectSlide(slide);
  }

  addShape(shapeType: ShapeType) {
    this.presentation.getActiveSlide?.addShape({ shapeType: shapeType });
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.presentation.getActiveSlide) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.presentation.getActiveSlide?.addImage({
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
    this.presentation.setActiveSlide = undefined;
    setTimeout(async () => {
      this.presentation.setActiveSlide = slide;
      const image = await slide.getLatestSlideImage();
      this.slideImages.set(slide.slideId, image);
    });
  }

  handleUpdate(event: any) {
    // this.presentation.publishEvent(event);
  }
  slideTimeOutMap: Map<string, any> = new Map();
  private listenPresentationEvents() {
    const listener = this.presentation.listenEvent();
    listener.subscribe((event) => {
      const slideId = event.slideId;
      const targetSlide = this.presentation.slides.find(
        (sl) => sl.slideId == slideId,
      );
      if (targetSlide) {
        let timeOutTracker = this.slideTimeOutMap.get(slideId!);
        clearTimeout(timeOutTracker);
        timeOutTracker = setTimeout(async () => {
          const image = await targetSlide.getLatestSlideImage();
          this.slideImages.set(slideId!, image);
          console.log("set");
          
        }, 1000);
        this.slideTimeOutMap.set(slideId!, timeOutTracker);
      }
    });
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
    this.presentation.name = this.name;
    this.presentationService.savePresentation(this.presentation);
  }
  pptTimeOutTracker: any;
  handleNameBlur() {
    if (this.name.trim().length == 0) {
      setTimeout(() => {
        this.name = this.presentation.name;
      });
    }
  }
}
enum ToolBoxType {
  TextToolBox,
  ImageToolBox,
  ShapeTooLBox,
  None,
}
