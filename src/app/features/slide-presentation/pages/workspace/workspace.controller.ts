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
  constructor(private agentService: LLM_Agents) {}
  magicSpiderEvent: Subject<AgentStreamEvent> = new Subject();
  magicSpiderInterrupt: Subject<boolean> = new Subject();

  triggerMagicSpider(params: {
    slideContent: string;
    presentation: Presentation;
  }) {
    this.showMagicSpiderAssistant = true;
    this.showSlideDescription = false;
    this.agentService.MagicSpiderStream({
      ...params,
      responseStream: this.magicSpiderEvent,
      interrupt: this.magicSpiderInterrupt,
    });
  }
}
