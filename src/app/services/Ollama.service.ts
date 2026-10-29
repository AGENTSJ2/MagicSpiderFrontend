import { Injectable } from '@angular/core';
import { ChatRequest, ChatResponse, Ollama } from 'ollama/browser';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types';
import { convertMcpToolToOpenAiTool } from '../agents/core/utility';
import {
  AgentKey,
  GeneratedImage,
  LlmChunk,
  LlmModel,
  LlmProvider,
  LlmThinkingLevel,
} from './llm-provider';

@Injectable({
  providedIn: 'root',
})
export class OllamaChatService extends LlmProvider {
  readonly id = 'ollama';
  readonly label = 'Ollama';
  private readonly DefaultModel = 'gemma4:e2b';
  private _host?: string;
  private _apiKey?: string;
  readonly availableModels: LlmModel[] = [];
  private modelsPromise?: Promise<LlmModel[]>;
  private readonly _models: Record<AgentKey, LlmModel | undefined> = {
    content: undefined,
    assistant: undefined,
    architect: undefined,
    image: undefined,
  };
  private readonly modelKeys: Record<AgentKey, string> = {
    content: 'OLLAMA-CONTENT-MODEL',
    assistant: 'OLLAMA-ASSISTANT-MODEL',
    architect: 'OLLAMA-ARCHITECT-MODEL',
    image: 'OLLAMA-IMAGE-MODEL',
  };
  private readonly hostStorageKey = 'OLLAMA-HOST';
  private readonly apiKeyStorageKey = 'OLLAMA-API-KEY';

  get host(): string | undefined {
    return this._host;
  }

  get apiKey(): string | undefined {
    return this._apiKey;
  }

  get isConfigured(): boolean {
    return !!this._host;
  }

  constructor() {
    super();
    this._host = localStorage.getItem(this.hostStorageKey)?.trim() || undefined;
    this._apiKey =
      localStorage.getItem(this.apiKeyStorageKey)?.trim() || undefined;
    (Object.keys(this.modelKeys) as AgentKey[]).forEach((agent) => {
      const modelString = localStorage.getItem(this.modelKeys[agent]);
      if (modelString) {
        this._models[agent] = JSON.parse(modelString);
      }
    });
  }

  updateConfig(host?: string, apiKey?: string): Promise<LlmModel[]> {
    this._host = host?.trim().replace(/\/+$/, '') || undefined;
    this._apiKey = apiKey?.trim() || undefined;
    this.persist(this.hostStorageKey, this._host);
    this.persist(this.apiKeyStorageKey, this._apiKey);
    // Drop the cached model list so it reloads against the new server.
    this.availableModels.length = 0;
    this.modelsPromise = undefined;
    return this.loadModels();
  }

  private persist(key: string, value?: string) {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }

  private requireClient(abortController?: AbortController): Ollama {
    if (!this._host) {
      throw new Error(
        'No Ollama server URL configured. Add it under AI Settings.',
      );
    }
    return new Ollama({
      host: this._host,
      headers: this._apiKey
        ? { Authorization: `Bearer ${this._apiKey}` }
        : undefined,
      // ollama-js ignores abort for non-streamed requests, so bind the signal via a per-request fetch
      fetch: abortController
        ? (input, init) =>
            fetch(input, { ...init, signal: abortController.signal })
        : undefined,
    });
  }

  loadModels(): Promise<LlmModel[]> {
    if (!this._host) {
      return Promise.resolve(this.availableModels);
    }
    if (!this.modelsPromise) {
      const client = this.requireClient();
      this.modelsPromise = (async () => {
        const { models } = await client.list();
        this.availableModels.push(
          ...models.map((model) => ({
            name: model.name,
            displayName: model.name,
          })),
        );
        return this.availableModels;
      })();
      // Allow a retry after a failed load (e.g. server down, bad key).
      this.modelsPromise.catch(() => (this.modelsPromise = undefined));
    }
    return this.modelsPromise;
  }

  getModel(agent: AgentKey): LlmModel | undefined {
    return this._models[agent];
  }

  updateModel(agent: AgentKey, model?: LlmModel): void {
    this.persist(
      this.modelKeys[agent],
      model ? JSON.stringify(model) : undefined,
    );
    this._models[agent] = model;
  }

  async chat(
    request: Partial<ChatRequest>,
    tools?: McpTool[],
    abortController?: AbortController,
    thinkingLevel?: LlmThinkingLevel,
  ): Promise<ChatResponse> {
    // TODO: drop the fallback once model selection is required again
    const model = request.model || this.DefaultModel;
    return this.requireClient(abortController).chat({
      ...request,
      model,
      keep_alive: '1h',
      tools: tools?.map(convertMcpToolToOpenAiTool),
      think: this.mapThinkingLevel(model, thinkingLevel),
      stream: false,
    });
  }

  /**
   * Ollama is used without streaming for now; the full response is emitted as
   * a single chunk so callers share the streaming contract with Gemini.
   */
  async streamChat(
    request: Partial<ChatRequest>,
    tools?: McpTool[],
    abortController?: AbortController,
    thinkingLevel?: LlmThinkingLevel,
  ): Promise<AsyncIterable<LlmChunk>> {
    const response = await this.chat(
      request,
      tools,
      abortController,
      thinkingLevel,
    );
    return (async function* () {
      yield {
        thinking: response.message.thinking,
        content: response.message.content,
        toolCalls: response.message.tool_calls?.map((toolCall) => ({
          name: toolCall.function.name,
          args: toolCall.function.arguments,
        })),
      };
    })();
  }

  // Only gpt-oss accepts thinking levels, other thinking models take a boolean.
  private mapThinkingLevel(
    model: string,
    level?: LlmThinkingLevel,
  ): ChatRequest['think'] {
    if (!level) {
      return undefined;
    }
    return model.startsWith('gpt-oss') ? level : true;
  }

  async generateImage(
    prompt: string,
    abortController?: AbortController,
  ): Promise<GeneratedImage> {
    throw Error('Image generation is not supported for Ollama');
  }
}
