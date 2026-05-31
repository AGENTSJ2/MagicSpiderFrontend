import { Injectable } from '@angular/core';
import { OllamaChatService } from './OllamaChatService';
import { Subject } from 'rxjs';
import { AbortableAsyncIterator, ChatResponse } from 'ollama';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { MCP } from '../features/slide-presentation/MCP/mcp_server';

@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  constructor(private chatService: OllamaChatService) {}

  private readonly ContentCreatorPrompt = [
    'You are an slide content creator your output should be a markdown of slide content ',
    'Your Response should not contain any user addressing or other junk just slide data',
    'An small summary of slides generated with side number topics are preferred so people can get an summary before going through the whole slide',
  ].join(' ');
  async ContentCreator(params: { userProblemStatement: string }) {
    const responseEvent = new Subject<AgentStreamEvent>();
    const interrupt = new Subject<boolean>();

    const stream = await this.chatService.streamChat({
      messages: [
        {
          role: 'system',
          content: this.ContentCreatorPrompt,
        },
        {
          role: 'user',
          content: params.userProblemStatement,
        },
      ],
    });
    this.pipeResponseToStream(responseEvent, stream);
    interrupt.subscribe((ev) => {
      if (ev) {
        stream.abort();
      }
    });
    return { responseEvent, interrupt };
  }

  async MagicSpider(params: { slideContent: string; mcp: MCP }) {
    
  }

  private async pipeResponseToStream(
    responseEvent: Subject<any>,
    stream: AbortableAsyncIterator<ChatResponse>,
  ) {
    try {
      for await (const chunk of stream) {
        if (chunk.message.thinking) {
          responseEvent.next({
            action: 'thinking',
            message: chunk.message.thinking,
          });
        }

        if (chunk.message.content) {
          responseEvent.next({
            action: 'content',
            message: chunk.message.content,
          });
        }
      }

      responseEvent.complete();
    } catch (error) {
      responseEvent.error(error);
    }
  }
}
export interface AgentStreamEvent {
  action: 'thinking' | 'content';
  message: string;
}
