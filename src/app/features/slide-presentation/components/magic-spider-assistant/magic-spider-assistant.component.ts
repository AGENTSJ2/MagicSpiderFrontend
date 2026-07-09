import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { GeminiService } from '../../../../services/gemini.service';
import { Model } from '@google/genai';
import { Subscription } from 'rxjs';
import { MagicSpiderAgentLoop } from '../../../../agents/magic-spider-loop';
import { AgentInActionStages, AgentState, InvokeEnabledStages } from '../../../../agents/core/utility';
import { waitForMilliseconds } from '../../../../core/utilities';

@Component({
  selector: 'app-magic-spider-assistant',
  templateUrl: './magic-spider-assistant.component.html',
  styleUrl: './magic-spider-assistant.component.scss',
})
export class MagicSpiderAssistantComponent implements OnDestroy {
  error = '';
  userComment: string = '';
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;
  AgentState = AgentState;
  agentSub?: Subscription;
  

  get defModel(): Model | undefined {
    return this.geminiService.getModel('assistant');
  }
  
  constructor(
    public workspaceController: WorkspaceController,
    private geminiService: GeminiService,
    public magicSpiderAgentLoop: MagicSpiderAgentLoop,
  ) {
    this.agentSub = magicSpiderAgentLoop.magicSpiderEventStream.subscribe((ev) => {
      this.scrollThinkingContOnValue();
    });
  }
  
  scrollThinkingContOnValue() {
    const el = this.thinkingBoxElement?.nativeElement;

    if (!el) {
      return;
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const threshold = 100; // px

    if (distanceFromBottom <= threshold) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }
  isAgentIntractable() {
    return InvokeEnabledStages.includes(
      this.magicSpiderAgentLoop.magicSpiderState,
    );
  }
  isAgentInMotion() {
    return AgentInActionStages.includes(
      this.magicSpiderAgentLoop.magicSpiderState,
    );
  }
  ngOnDestroy(): void {
    this.agentSub?.unsubscribe();
    this.magicSpiderAgentLoop.InterruptMagicSpider();
  }

  startMagicSpider() {
    if (this.isAgentIntractable()) {
      this.magicSpiderAgentLoop.triggerMagicSpider({
        scratchBook: this.workspaceController.attachScratchBook
          ? this.workspaceController.scratchBookContent
          : '',
        presentation: this.workspaceController.activePresentation!,
        userComment: this.userComment,
      });
    } else {
      this.magicSpiderAgentLoop.InterruptMagicSpider();
    }
  }
}
