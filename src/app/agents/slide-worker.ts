import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  AgentState,
  AgentStreamEvent,
  convertMcpToolToOpenAiTool,
  pipeResponseToStream,
} from './core/utility';
import { GeminiService } from '../services/gemini.service';
import { ArchitectSlidePlan } from './slide-architect';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Message, ToolCall } from 'ollama';
import { McpHub } from '../features/slide-presentation/MCP/mcp_hub';
import { InternalMcpError } from '../features/slide-presentation/MCP/mcp.erros';
import { waitForMilliseconds } from '../core/utilities';
import { MAX_RETRY, RETRY_TIME_OUT_MS } from './core/constants';

@Injectable({
  providedIn: 'root',
})
export class SlideWorkerAgent {
  constructor(
    private chatService: GeminiService,
    private mcpHub: McpHub,
  ) {}
  private async invokeTools(toolCalls: ToolCall[]): Promise<Message> {
    const ackMessage: Message = {
      role: 'assistant',
      content: '',
    };
    for (let tool of toolCalls) {
      try {
        const result = await this.mcpHub.callTool({
          toolName: tool.function.name,
          args: tool.function.arguments,
        });
        ackMessage.content += `Successfully called[${tool.function.name}] result : ${JSON.stringify(result.content)} \n`;
      } catch (error) {
        ackMessage.content += `An Error occur while calling [${tool.function.name}] Error: ${(error as InternalMcpError).message}\n`;
        console.log(error);
      }
    }
    return ackMessage;
  }

  async run(params: {
    slidePlan: ArchitectSlidePlan;
    presentation: Presentation;
    magicSpiderEvent: Subject<AgentStreamEvent>;
    abortController: AbortController;
  }) {
    let slide = params.presentation.slides.find(
      (sl) => sl.slideId == params.slidePlan.slideId,
    );
    if (!slide) {
      slide = params.presentation.addSlide();
    }

    params.magicSpiderEvent.next({
      action: AgentState.thinking,
      message: `\nImplementing slide ${slide.slideId}\n`,
    });

    const messages: Message[] = [
      {
        role: 'system',
        content: MagicSpiderPrompt,
      },
      {
        role: 'user',
        content: `Architecture plan for slide ${slide.slideId} : ${JSON.stringify(params.slidePlan.components)}`,
      },
    ];

    const slideJson = JSON.stringify(slide.toJson());
    const tools = await this.mcpHub.listTools();
    
    let retry = 0;
    let completed :boolean = false;
    
    while (!params.abortController.signal.aborted && retry < MAX_RETRY) {
      try {
        const responseEvent = new Subject<AgentStreamEvent>();

        const response = await this.chatService.streamChat(
          {
            model: this.chatService.getModel('assistant')?.name,
            messages: [
              ...messages,
              {
                role: 'user',
                content: `Latest Slide JSON ${slideJson}`,
              },
            ],
            tools: tools.map((tl) => convertMcpToolToOpenAiTool(tl)),
          },
          tools,
          params.abortController,
        );

        const toolCalls: ToolCall[] = [];
        responseEvent.subscribe((event) => {
          params.magicSpiderEvent.next(event);
          if (event.functionCall) {
            toolCalls.push({
              function: {
                name: event.functionCall.name!,
                arguments: event.functionCall.args,
              },
            });
          }
        });
        
        await pipeResponseToStream(
          responseEvent,
          response.stream,
          response.provider,
        );
        
        // responseEvent.complete(); 

        if (toolCalls.length == 0) {
          console.log('slide completed gracefully');
          completed = true;
          params.slidePlan.completed = true;
          break;
        }
        const ackMessage = await this.invokeTools(toolCalls);
        messages.push(ackMessage);
      } catch (error) {
        retry++;
        waitForMilliseconds(RETRY_TIME_OUT_MS);
      }
    }
    return completed;
  }
}
const MagicSpiderPrompt = [
  'You are Magic Spider an implementation Agent who can access slide creation tools that have been provided to u ',
  `The slide is a canvas of Height 750 Width 1333 so u can use x and y with in this limit and position`,
  'You can use them to create and update slide u can use each tool appropriately',
  'you can call multiple tools at an time if u need as an list',
  'A Slide Architect has already designed the presentation, you will receive the architecture plan of exactly ONE slide and the latest JSON of that slide only',
  'Do not redesign or re-architect, focus only on implementing every component task of the given plan on the given slide',
  'When a component task carries an id update that existing component, when it has no id create it with the matching add tool',
  'Always target the slide id you were given and never touch any other slide',
  'If you believe that every task in the plan for this slide is complete then make the response function call list empty so that we can stop gracefully',
  'Never continue issuing tool calls after the task is complete.',
].join(' ');
