import { Injectable } from '@angular/core';
import {
  AgentState,
  AgentStreamEvent,
  getAgentErrorMessage,
} from './core/utility';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Observable, Subject, Subscription } from 'rxjs';
import {
  PresentationArchitecture,
  SlideArchitectAgent,
} from './slide-architect';
import { McpActions } from '../features/slide-presentation/MCP/mcp.actions';
import { SlideWorkerAgent } from './slide-worker';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class MagicSpiderAgentLoop {
  private magicSpiderEvent: Subject<AgentStreamEvent> = new Subject();
  private magicSpiderInterrupt: Subject<boolean> = new Subject();
  private spiderInterruptSub?: Subscription;

  magicSpiderState: AgentState = AgentState.idle;
  architecture?: PresentationArchitecture;
  magicSpiderEventStream: Observable<AgentStreamEvent> = this.magicSpiderEvent.asObservable();

  private thinkLogs:string = "";
  private contentLogs:string = "";

  get getThinkLogs() {
    return this.thinkLogs;
  }
  get getContentLogs() {
    return this.contentLogs;
  }
  constructor(
    private mcpActions: McpActions,
    private slideArchitect: SlideArchitectAgent,
    private slideWorker: SlideWorkerAgent,
    private message:NzMessageService
  ) {
    this.magicSpiderEventStream.subscribe((event) => {
      this.magicSpiderState = event.action;
      switch (event.action) {
        case AgentState.thinking:
          this.thinkLogs += event.message;
          break;
        case AgentState.function:
          this.thinkLogs += `\nCalling Tool : ${event.functionCall?.name}\n`;
          break;
        case AgentState.content:
          this.contentLogs = event.message;
          break;
        case AgentState.done:
          this.thinkLogs = '';
          break;
        case AgentState.error:
          this.thinkLogs = '';
          this.message.error(getAgentErrorMessage(event.message))
          break;
      }
    });
  }

  triggerMagicSpider(params: {
    scratchBook: string;
    presentation: Presentation;
    userComment: string;
  }) {
    this.MagicSpiderAgentLoop({
      ...params,
    });
  }

  InterruptMagicSpider() {
    this.magicSpiderInterrupt.next(true);
  }

  private async MagicSpiderAgentLoop(params: {
    scratchBook: string;
    userComment: string;
    presentation: Presentation;
  }) {
    let stop: boolean = false;
    const abortController = new AbortController();
    this.spiderInterruptSub?.unsubscribe();
    this.spiderInterruptSub = this.magicSpiderInterrupt.subscribe((intr) => {
      stop = intr;
      if (stop) {
        abortController.abort();
      }
    });

    this.magicSpiderEvent.next({
      action: AgentState.invoked,
      message: 'Magic Spider has been called',
    });

    this.magicSpiderEvent.next({
      action: AgentState.thinking,
      message: '\nSlide Architect is drafting the presentation plan\n',
    });

    try {
      const availableImages = await this.mcpActions.getAvailableImageList();

      this.architecture ??= await this.slideArchitect.run(
        {
          userPrompt: params.userComment,
          scratchBook: params.scratchBook,
          currentSlideJson: JSON.stringify(
            params.presentation.slides.map((sl) => sl.toJson()),
          ),
          imagesAvailable: (availableImages.content.at(0) as any)?.resource
            .text,
          magicSpiderEvent:this.magicSpiderEvent
        },
        abortController,

      );
      for (const slidePlan of this.architecture.presentation.slides) {
        if (stop) {
          break;
        }
        if (slidePlan.planProgress) {
          continue;
        }
        await this.slideWorker.run({
          slidePlan,
          presentation: params.presentation,
          abortController: abortController,
          magicSpiderEvent: this.magicSpiderEvent,
        });
      }

      this.magicSpiderEvent.next({
        action: AgentState.done,
        message: 'Success fully stopped',
      });
      this.architecture = undefined;
    } catch (error) {
      this.magicSpiderEvent.next({
        action: AgentState.error,
        message: error?.toString() ?? 'Unknown error',
      });
    } finally {
      this.spiderInterruptSub?.unsubscribe();
    }
  }
}
