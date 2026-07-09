import { Injectable } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { PresentationService } from '../../../../services/konva.services/presentation.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivePresentationContext } from '../../services/active-presentation.context';
import { SettingsComponent } from '../settings/settings.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { isApiKeyError } from '../../../../agents/core/utility';
import { ICanvasComponent } from '../../domain/canvasModels/ICanvasComponent';
import { MagicSpiderAgentLoop } from '../../../../agents/magic-spider-loop';
import { ContentCreatorAgent } from '../../../../agents/content-creator';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceController {
  showMagicSpiderAssistant: boolean = false;
  showSlideDescription: boolean = false;
  showToolBox: boolean = false;
  showImageToolBox:boolean = false;
  attachScratchBook: boolean = true;
  selectedComponent?: ICanvasComponent;

  constructor(
    private presentationService: PresentationService,
    private message: NzMessageService,
    private presentationContext: ActivePresentationContext,
    private modal:NzModalService,
    private magicSpiderLoop:MagicSpiderAgentLoop,
    private contentCreator:ContentCreatorAgent
  ) {}

  public get activePresentation(): Presentation | undefined {
    return this.presentationContext.activePresentation;
  }

  public set setActivePresentation(v: Presentation | undefined) {
    if(v == undefined) {
      this.magicSpiderLoop.InterruptMagicSpider();
      this.contentCreator.interruptContentCreator();
    }
    this.presentationContext.activePresentation = v;
  }

  scratchBookContent: string = ``;
  showMagicSpider() {
    this.showMagicSpiderAssistant = true;
    this.showSlideDescription = false;
    this.showImageToolBox = false;
    this.showToolBox = false;
  }

  toggleToolBox(show: boolean) {
    if (show) {
      this.showMagicSpiderAssistant = false;
      this.showSlideDescription = false;
      this.showImageToolBox = false;
    }
    this.showToolBox = show;
  }

  toggleImageToolBox()
  {
    this.showImageToolBox = !this.showImageToolBox;
    if(this.showImageToolBox)
    {
      this.showMagicSpiderAssistant = false;
      this.showToolBox = false;
    }
  }
  
  handleOpenSettings(select?:'ai'|'user') {
    const modelRef = this.modal.create({
      nzTitle: 'Settings',
      nzContent: SettingsComponent,
      nzFooter: null,
      nzWidth: 720,
      nzBodyStyle: {
        padding: '0',
      },
    });
    if(select)
    {
      const comp = modelRef.getContentComponent();
      comp.activeSection = select;
    }
  }

  async exportPPT(presentation: Presentation) {
    try {
      await this.presentationService.exportPPTtoPPTX(presentation);
      this.message.success('Presentation Exported');
    } catch (error) {
      this.message.error('Some error occur');
      console.log(error);
    }
  }
  clearAllSelection() {
    this.activePresentation?.getActiveSlide?.controller.clearSelections();
    this.selectedComponent = undefined;
  }
}
