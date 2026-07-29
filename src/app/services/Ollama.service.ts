import { Injectable } from '@angular/core';
import { AbortableAsyncIterator, ChatRequest, ChatResponse, Message, Ollama } from 'ollama';
import { GenerateContentResponse, ThinkingLevel } from '@google/genai';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types';
import { convertMcpToolToOpenAiTool } from '../agents/core/utility';

@Injectable({
  providedIn: 'root',
})
export class OllamaChatService  {
  readonly AvailableModel = 'gemma4:e4b';
  private readonly ollama = new Ollama({
    host: 'http://192.168.0.160:5000',
  });

  async streamChat(
    request: Partial<ChatRequest>,
    tools?: McpTool[],
    abortController?: AbortController,
    thinkingLevel?: ThinkingLevel,
  ): Promise<{
    stream: AbortableAsyncIterator<ChatResponse>;
    provider: string;
  }> {
    const stream = await this.ollama.chat({
      model: this.AvailableModel,
      keep_alive: '1h',
      tools: tools?.map(convertMcpToolToOpenAiTool),
      think: this.mapThinkingLevel(thinkingLevel),
      ...request,
      stream: true,
    });

    abortController?.signal.addEventListener('abort', () => stream.abort());

    return { stream, provider: 'ollama' };
  }

  private mapThinkingLevel(
    level?: ThinkingLevel,
  ): ChatRequest['think'] {
    switch (level) {
      case ThinkingLevel.HIGH:
        return 'high';
      case ThinkingLevel.MEDIUM:
        return 'medium';
      case ThinkingLevel.LOW:
      case ThinkingLevel.MINIMAL:
        return 'low';
      default:
        return undefined;
    }
  }

  async chat(request: Partial<ChatRequest>) {
    const stream = await this.ollama.chat({
      model: this.AvailableModel,
      messages: [
        {
          role: 'user',
          content: 'write an poem about model context protocol',
        },
      ],
      keep_alive: '1h',
      ...request,
      stream: false,
    });
    return stream;
  }
}
