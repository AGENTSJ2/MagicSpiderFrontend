import { Injectable } from '@angular/core';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { AgentStreamEvent, LLM_Agents } from '../../../../services/agents';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceController {
  showMagicSpiderAssistant: boolean = false;
  showSlideDescription: boolean = false;
  showToolBox: boolean = false;

  constructor(private agentService: LLM_Agents) {}
  _activePresentation?: Presentation;
  public get activePresentation(): Presentation | undefined {
    return this._activePresentation;
  }

  public set setActivePresentation(v: Presentation | undefined) {
    this._activePresentation = v;
  }

  magicSpiderEvent: Subject<AgentStreamEvent> = new Subject();
  magicSpiderInterrupt: Subject<boolean> = new Subject();
  latestSlideMarkdown: string = ``;
  showMagicSpider(params: { slideContent: string }) {
    this.latestSlideMarkdown = params.slideContent.trim();
    this.showMagicSpiderAssistant = true;
    this.showSlideDescription = false;
  }

  toggleToolBox(show:boolean)
  {
    if(show)
    {
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
}
