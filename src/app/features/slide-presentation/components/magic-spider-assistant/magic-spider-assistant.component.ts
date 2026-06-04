import { Component, ElementRef, ViewChild } from '@angular/core';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';

@Component({
  selector: 'app-magic-spider-assistant',
  templateUrl: './magic-spider-assistant.component.html',
  styleUrl: './magic-spider-assistant.component.scss',
})
export class MagicSpiderAssistantComponent {
  thinkingText = '';
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;
  calls: any[] = [];
  constructor(private workspaceController: WorkspaceController) {
    workspaceController.magicSpiderEvent.subscribe((ev) => {
      if (ev.action == 'thinking') {
        this.thinkingText += ev.message;
        this.thinkingBoxElement?.nativeElement.scrollTo({
          top: this.thinkingBoxElement.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }
      if (ev.action == 'function') {
        this.calls.push(ev.functionCall);
      }
    });
  }
}
