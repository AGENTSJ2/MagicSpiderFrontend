import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { AgentState } from '../../../../services/agents';
import { GeminiService } from '../../../../services/gemini.service';
import { Model } from '@google/genai';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-magic-spider-assistant',
  templateUrl: './magic-spider-assistant.component.html',
  styleUrl: './magic-spider-assistant.component.scss',
})
export class MagicSpiderAssistantComponent implements OnDestroy{
  thinkingText = '';
  contentText =  '';
  error = '';
  userComment:string = "";
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;
  state: AgentState = AgentState.idle;
  AgentState = AgentState;
  defModel?:Model;
  agentSub?:Subscription;
  attachScratchBook:boolean = false;
  
  constructor(public workspaceController: WorkspaceController,private geminiService:GeminiService) {
    this.defModel = geminiService.defaultModel;
    this.agentSub = workspaceController.magicSpiderEvent.subscribe((ev) => {
      this.state = ev.action;
      console.log(ev.action);
      switch (ev.action) {
        case AgentState.thinking:
          this.thinkingText += ev.message;
          this.thinkingBoxElement?.nativeElement.scrollTo({
            top: this.thinkingBoxElement.nativeElement.scrollHeight,
            behavior: 'smooth',
          });
          break;
        case AgentState.function:
          this.thinkingText += ev.functionCall?.name;
          break;
        case AgentState.content:
          this.contentText = ev.message;
          break;
        case AgentState.done :
          this.thinkingText = "";
          break
        case AgentState.error:
          this.thinkingText = "";
          this.error = ev.message;
          break
      }
    });
  }
  isAgentIntractable()
  {
    const interStates = [AgentState.idle , AgentState.error , AgentState.done];
    return interStates.includes(this.state);
  }
  ngOnDestroy(): void {
    this.agentSub?.unsubscribe();
  }

  startMagicSpider()
  {
    if(this.state == AgentState.done || this.state == AgentState.idle)
    {
      this.workspaceController.triggerMagicSpider({
        slideContent:this.attachScratchBook ?this.workspaceController.scratchBookContent : '',
        presentation:this.workspaceController.activePresentation!,
        userComment:this.userComment,
      })
    }
  }
}
