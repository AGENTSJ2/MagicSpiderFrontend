import { Injectable } from '@angular/core';
import { OllamaChatService } from './OllamaChatService';
import { Subject } from 'rxjs';
import { AbortableAsyncIterator, ChatResponse } from 'ollama';

@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  constructor(private chatService: OllamaChatService) {}

  private readonly ContentCreatorPromt = [
    'You are an slide content creator your output should be a markdown of slide content ',
    'Your Response should not contain any user adressing or other junk just slide data',
  ].join(' ');
  async ContentCreator(params: { userProblemStatement: string }) {
    const responseEvent = new Subject<{
      action: 'thinking' | 'content';
      message: string;
    }>();
    const interrupt = new Subject<boolean>();

    const stream = await this.chatService.streamChat({
      messages: [
        {
          role: 'system',
          content: this.ContentCreatorPromt,
        },
        {
          role: 'user',
          content: params.userProblemStatement,
        },
      ],
    });
    this.pipeResponseToStream(responseEvent, stream);
    interrupt.subscribe((ev)=>{
        if(ev)
        {
            stream.abort();
        }
    })
    return responseEvent;
  }

  private async pipeResponseToStream(
    responseEvent: Subject<any>,
    stream: AbortableAsyncIterator<ChatResponse>,
  ) {
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
  }
}
