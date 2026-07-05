import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { GeminiService } from '../../../../services/gemini.service';
import { Model } from '@google/genai';
import { Subscription } from 'rxjs';
import { MagicSpiderAgentLoop } from '../../../../agents/magic-spider-loop';
import { AgentInActionStages, AgentState, InvokeEnabledStages } from '../../../../agents/core/utility';

@Component({
  selector: 'app-magic-spider-assistant',
  templateUrl: './magic-spider-assistant.component.html',
  styleUrl: './magic-spider-assistant.component.scss',
})
export class MagicSpiderAssistantComponent implements OnDestroy {
  thinkingText = '';
  contentText = '';
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
    private magicSpiderAgentLoop: MagicSpiderAgentLoop,
  ) {
    this.agentSub = magicSpiderAgentLoop.magicSpiderEventStream.subscribe((ev) => {
      switch (ev.action) {
        case AgentState.thinking:
          this.thinkingText += ev.message;
          this.scrollThinkingContOnValue();
          break;
        case AgentState.function:
          this.thinkingText += `\nCalling Tool : ${ev.functionCall?.name}\n`;
          this.scrollThinkingContOnValue();
          break;
        case AgentState.content:
          this.contentText = ev.message;
          this.scrollThinkingContOnValue();
          break;
        case AgentState.done:
          this.thinkingText = '';
          break;
        case AgentState.error:
          this.thinkingText = '';
          this.error = ev.message;
          this.workspaceController.handleAgentError(ev.message);
          break;
      }
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
