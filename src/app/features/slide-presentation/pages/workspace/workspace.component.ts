import { Component, ElementRef, ViewChild } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import {
  PresentationEvent,
  PresentationEventType,
} from '../../domain/EventModels/presentationEvents.model';
import { WorkspaceController } from './workspace.controller';
import { PresentationService } from '../../../../services/konva.services/presentation.service';
import { ActivatedRoute } from '@angular/router';
import { ICanvasComponent } from '../../domain/canvasModels/ICanvasComponent';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import blobService from '../../../../services/blob.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  presentation!: Presentation;
  TooBoxType = ToolBoxType;
  ShapeType = ShapeType;
  name: string = '';
  slideImages: Map<string, string> = new Map();
  @ViewChild('pptList')
  pptList!: ElementRef;
  hasUnSavedChanges: boolean = false;
  loading: boolean = false;
  sidebarCollapsed: boolean = false;
  constructor(
    public workSpaceController: WorkspaceController,
    private presentationService: PresentationService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modal: NzModalService,
  ) {
    const id = this.route.snapshot.queryParamMap.get('id');
    this.setUpPresentation(id!);
  }

  async setUpPresentation(presentationId: string) {
    try {
      this.loading = true;
      this.presentation =
        await this.presentationService.getPresentation(presentationId);
      this.name = this.presentation.name;
      this.workSpaceController.setActivePresentation = this.presentation;
      this.workSpaceController.scratchBookContent =
        await this.presentationService.getScratchBook(this.presentation.id);
      const firstSlide = this.presentation.slides.at(0);
      this.listenPresentationEvents();
      if (firstSlide) {
        this.selectSlide(firstSlide);
      }
      this.hasUnSavedChanges = false;
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  selectedToolBox: ToolBoxType = ToolBoxType.None;
  activeEvent?: PresentationEvent;
  initialXandY = { x: 144, y: 144 };
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  handleAddText() {
    this.presentation.getActiveSlide?.addText({config:{
      attrs:{
        x:this.initialXandY.x,
        y:this.initialXandY.y,
      },
      zIndex:0
    }});
    this.workSpaceController.toggleToolBox(true);
  }

  addSlide() {
    const slide = this.presentation.addSlide();
    this.selectSlide(slide);
    setTimeout(() => {
      this.pptList?.nativeElement.scrollTo({
        left: this.pptList.nativeElement.scrollWidth,
        behavior: 'smooth',
      });
    });
  }

  addShape(shapeType: ShapeType) {
    this.presentation.getActiveSlide?.addShape({ shapeType: shapeType ,config:{
      attrs:{
        x:this.initialXandY.x,
        y:this.initialXandY.y,
      },
      zIndex:0
    } });
    this.workSpaceController.toggleToolBox(true);
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.presentation.getActiveSlide) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const appImage = blobService.addImage(reader.result as string);
      this.presentation.getActiveSlide?.addImage({
        config: {
          attrs: {
            imageId: appImage.id,
            x:this.initialXandY.x,
            y:this.initialXandY.y
          },
          zIndex: 0,
        },
      });
      this.workSpaceController.toggleToolBox(true);

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

  slideTimeOutMap: Map<string, any> = new Map();
  selectedComponent?: ICanvasComponent;
  private listenPresentationEvents() {
    const listener = this.presentation.listenEvent();
    listener.subscribe((event) => {
      const slideId = event.slideId;
      const targetSlide = this.presentation.slides.find(
        (sl) => sl.slideId == slideId,
      );
      if (!targetSlide) {
        return;
      }
      const targetComponent = targetSlide?.components.find(
        (cm) => event.nodeId == cm.node._id.toString(),
      );
      if (event.trackHistory) {
        this.hasUnSavedChanges = true;
        let timeOutTracker = this.slideTimeOutMap.get(slideId!);
        clearTimeout(timeOutTracker);
        timeOutTracker = setTimeout(async () => {
          const image = await targetSlide.getLatestSlideImage();
          this.slideImages.set(slideId!, image);
        }, 1000);
        this.slideTimeOutMap.set(slideId!, timeOutTracker);
      }
      if (event.eventType == PresentationEventType.SELECT) {
        this.selectedToolBox = this.getToolBoxType(targetComponent!);
      }
      this.setSelectedComponent(targetComponent);
    });
  }

  setSelectedComponent(component: ICanvasComponent | undefined) {
    this.selectedComponent = undefined;
    setTimeout(() => {
      this.selectedComponent = component;
    });
  }

  getToolBoxType(comp: ICanvasComponent): ToolBoxType {
    switch (comp.node.className) {
      case 'Text':
        return ToolBoxType.TextToolBox;
      case 'Image':
        return ToolBoxType.ImageToolBox;
      case 'Rect':
        return ToolBoxType.ShapeTooLBox;
      case 'Circle':
        return ToolBoxType.ShapeTooLBox;
      default:
        return ToolBoxType.None;
    }
  }

  handleRemoveSlide(item: Slide, event: Event) {
    event.stopImmediatePropagation();
    this.presentation.removeSlide(item);
  }

  dropSlide(event: CdkDragDrop<Slide[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.presentation.moveSlide(event.previousIndex, event.currentIndex);
    this.hasUnSavedChanges = true;
  }

  handleOpenAiDescription() {
    this.workSpaceController.showSlideDescription = true;
  }

  toggleMagicAssistant(state: boolean) {
    if (state) {
      this.workSpaceController.showMagicSpider();
    } else {
      this.workSpaceController.showMagicSpiderAssistant = false;
    }
  }

  async savePpt() {
    this.presentation.name = this.name;
    const firstslide = this.presentation.slides.at(0);
    const thumbnail = this.slideImages.get(firstslide?.slideId ?? '') ?? '';
    await this.presentationService.savePresentation(
      this.presentation,
      thumbnail,
    );
    this.message.success('Presentation Saved');
    this.hasUnSavedChanges = false;
  }

  pptTimeOutTracker: any;
  handleNameBlur() {
    if (this.name.trim().length == 0) {
      setTimeout(() => {
        this.name = this.presentation.name;
      });
    }
  }

  canDeactivate() {
    if (this.hasUnSavedChanges) {
      const save = confirm('There are unsaved changes');
      if (save) {
        this.savePpt();
      }
    }
    return true;
  }
  handleRemoveComponent(component:ICanvasComponent) {
    const slide : Slide = (component as any).slide as Slide;
    slide.removeComponent(component)
  }
}
enum ToolBoxType {
  TextToolBox = 'Text',
  ImageToolBox = 'Image',
  ShapeTooLBox = 'Shape',
  None = 'None',
}
