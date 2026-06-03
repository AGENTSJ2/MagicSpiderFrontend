import { Component } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';

@Component({
  selector: 'app-magic-spider-assistant',
  templateUrl: './magic-spider-assistant.component.html',
  styleUrl: './magic-spider-assistant.component.scss'
})
export class MagicSpiderAssistantComponent {
  thinking = "";
  calls:any[] = []
  constructor(private workspaceController:WorkspaceController){
    workspaceController.magicSpiderEvent.subscribe((ev)=>{
      if(ev.action == 'thinking')
      {
        this.thinking+=ev.message
      }
      if(ev.action == 'function')
      {
        this.calls.push(ev.functionCall);
      }
    })
  }
}
