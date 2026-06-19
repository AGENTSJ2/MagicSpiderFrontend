import { Injectable } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { AgentStreamEvent, LLM_Agents } from '../../../../services/agents';
import { Subject } from 'rxjs';
import { PresentationService } from '../../../../services/konva.services/presentation.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivePresentationContext } from '../../services/active-presentation.context';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceController {
  showMagicSpiderAssistant: boolean = false;
  showSlideDescription: boolean = false;
  showToolBox: boolean = false;
  showImageToolBox:boolean = false;
  constructor(
    private agentService: LLM_Agents,
    private presentationService: PresentationService,
    private message: NzMessageService,
    private presentationContext: ActivePresentationContext,
  ) {}

  public get activePresentation(): Presentation | undefined {
    return this.presentationContext.activePresentation;
  }

  public set setActivePresentation(v: Presentation | undefined) {
    this.presentationContext.activePresentation = v;
  }

  magicSpiderEvent: Subject<AgentStreamEvent> = new Subject();
  magicSpiderInterrupt: Subject<boolean> = new Subject();
  latestSlideMarkdown: string = ``;
  showMagicSpider(params: { slideContent: string }) {
    this.latestSlideMarkdown = params.slideContent.trim();
    this.showMagicSpiderAssistant = true;
    this.showSlideDescription = false;
  }

  toggleToolBox(show: boolean) {
    if (show) {
      this.showMagicSpiderAssistant = false;
      this.showSlideDescription = false;
    }
    this.showToolBox = show;
  }

  triggerMagicSpider(params: {
    slideContent: string;
    presentation: Presentation;
    userComment: string;
  }) {
    this.agentService.MagicSpiderStream({
      ...params,
      responseStream: this.magicSpiderEvent,
      interrupt: this.magicSpiderInterrupt,
    });
  }

  toggleImageToolBox()
  {
    this.showImageToolBox = !this.showImageToolBox;
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
}
