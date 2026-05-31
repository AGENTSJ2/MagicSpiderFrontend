import { Injectable } from '@angular/core';
import { ChatRequest, Message, Ollama } from 'ollama';

@Injectable({
  providedIn: 'root',
})
export class OllamaChatService {
  readonly AvilableModel = 'gemma4:e4b';
  private readonly ollama = new Ollama({
    host: 'http://192.168.1.9:11434',
  });
  async streamChat(request: Partial<ChatRequest>) {
    const stream = await this.ollama.chat({
      ...request,
      model: this.AvilableModel,
      messages: [{
        role:'user',
        content:"write an poem about model context protocol"
      }],
      stream: true,
      keep_alive:"1h"
    });
    return stream;
    // let thought = '';
    // let resp = '';
    // for await (const chunk of stream) {
    //   if (chunk.message.thinking) {
    //     thought += chunk.message.thinking;
    //     console.log("[THINKING] : ",thought)
    //   }
    //   if (chunk.message.content) {
    //     resp += chunk.message.content;
    //     console.log("[THINKING] : ",thought)
    //     console.log("[Content] : ",resp)
    //   }
    // }
  }
}
