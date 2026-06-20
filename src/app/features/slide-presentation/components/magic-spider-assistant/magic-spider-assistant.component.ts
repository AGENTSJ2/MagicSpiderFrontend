import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { AgentState, LLM_Agents } from '../../../../services/agents';
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
  AgentState = AgentState;
  agentSub?:Subscription;
  attachScratchBook:boolean = false;

  get defModel(): Model | undefined {
    return this.geminiService.getModel('assistant');
  }

  constructor(public workspaceController: WorkspaceController,private geminiService:GeminiService,private agentService:LLM_Agents) {
    this.agentSub = agentService.magicSpiderEventStream.subscribe((ev) => {
      switch (ev.action) {
        case AgentState.thinking:
          this.thinkingText += ev.message;
          this.thinkingBoxElement?.nativeElement.scrollTo({
            top: this.thinkingBoxElement.nativeElement.scrollHeight,
            behavior: 'smooth',
          });
          break;
        case AgentState.function:
          this.thinkingText += `\nTool Call : ${ev.functionCall?.name}\n`;
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
  
  isAgentIntractable(){
    return this.agentService.InvokeEnabledStages.includes(this.agentService.magicSpiderState);
  }
  isAgentInMotion()
  {
    return this.agentService.AgentInActionStages.includes(this.agentService.magicSpiderState);
  }
  ngOnDestroy(): void {
    this.agentSub?.unsubscribe();
  }

  startMagicSpider()
  {
    if(this.isAgentIntractable())
    {
      this.agentService.triggerMagicSpider({
        slideContent:this.attachScratchBook ?this.workspaceController.scratchBookContent : '',
        presentation:this.workspaceController.activePresentation!,
        userComment:this.userComment,
      })
    }else
    {
      this.agentService.InterruptMagicSpider();
    }
  }
}
