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
      model: this.AvilableModel,
      messages: [{
        role:'user',
        content:"write an poem about model context protocol"
      }],
      keep_alive:"1h",
      ...request,
      stream: true,
    });
    return stream;
  }
}
