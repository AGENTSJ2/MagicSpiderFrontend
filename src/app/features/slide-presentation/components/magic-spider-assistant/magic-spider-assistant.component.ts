import { Component, ElementRef, ViewChild } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { AgentState, LLM_Agents } from '../../../../services/agents';

@Component({
  selector: 'app-magic-spider-assistant',
  templateUrl: './magic-spider-assistant.component.html',
  styleUrl: './magic-spider-assistant.component.scss',
})
export class MagicSpiderAssistantComponent {
  thinkingText = '';
  contentText =  '';
  error = '';
  calls: any[] = [];
  userComment:string = "";
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;
  state: AgentState = AgentState.idle;
  AgentState = AgentState;
  constructor(public workspaceController: WorkspaceController,private agentService:LLM_Agents) {
    workspaceController.magicSpiderEvent.subscribe((ev) => {
      this.state = ev.action;
      console.log(ev.action);
      switch (ev.action) {
        case 'thinking':
          this.thinkingText += ev.message;
          this.thinkingBoxElement?.nativeElement.scrollTo({
            top: this.thinkingBoxElement.nativeElement.scrollHeight,
            behavior: 'smooth',
          });
          break;
        case 'function':
          this.calls.push(ev.functionCall);
          break;
        case 'content':
          this.contentText = ev.message;
          break;
        case 'done' :
          break
        case 'error':
          this.error = ev.message;
          break
      }
    });
  }
  startMagicSpider()
  {
    if(this.state == AgentState.done || this.state == AgentState.idle)
    {
      this.workspaceController.triggerMagicSpider({
        slideContent:this.workspaceController.latestSlideMarkdown,
        presentation:this.workspaceController.activePresentation!,
        userComment:this.userComment,
      })
    }
  }
}
