import { Injectable } from '@angular/core';
import {
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
  Model,
  Part,
} from '@google/genai';
import { ChatRequest, ChatResponse } from 'ollama';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types';

export type AgentKey = 'content' | 'assistant';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ModelName: string = 'gemma-4-31b-it';
  private gemini?: GoogleGenAI;
  private _apiKey?: string;
  readonly availableModels: Model[] = [];
  private modelsPromise?: Promise<Model[]>;
  private readonly _models: Record<AgentKey, Model | undefined> = {
    content: undefined,
    assistant: undefined,
  };
  private readonly modelKeys: Record<AgentKey, string> = {
    content: 'CONTENT-MODEL',
    assistant: 'ASSISTANT-MODEL',
  };
  private readonly apiKeyStorageKey = 'GEMINI-API-KEY';
  private readonly legacyDefModelKey = 'DEF-MODEL';

  get apiKey(): string | undefined {
    return this._apiKey;
  }

  get hasApiKey(): boolean {
    return !!this._apiKey;
  }

  constructor() {
    const storedKey = localStorage.getItem(this.apiKeyStorageKey)?.trim();
    if (storedKey) {
      this._apiKey = storedKey;
      this.gemini = new GoogleGenAI({ apiKey: storedKey });
      this.loadModels();
    }
    this.loadAgentModels();
  }
  
  updateApiKey(key?: string): Promise<Model[]> {
    const trimmed = key?.trim();
    if (trimmed) {
      localStorage.setItem(this.apiKeyStorageKey, trimmed);
      this._apiKey = trimmed;
      this.gemini = new GoogleGenAI({ apiKey: trimmed });
    } else {
      localStorage.removeItem(this.apiKeyStorageKey);
      this._apiKey = undefined;
      this.gemini = undefined;
    }
    // Drop the cached model list so it reloads against the new key.
    this.availableModels.length = 0;
    this.modelsPromise = undefined;
    return this.loadModels();
  }

  private requireClient(): GoogleGenAI {
    if (!this.gemini) {
      throw new Error(
        'No Gemini API key configured. Add your API key under AI Settings.',
      );
    }
    return this.gemini;
  }

  loadModels(): Promise<Model[]> {
    if (!this.gemini) {
      return Promise.resolve(this.availableModels);
    }
    if (!this.modelsPromise) {
      const client = this.gemini;
      this.modelsPromise = (async () => {
        const models = await client.models.list();
        for await (const model of models) {
          this.availableModels.push(model);
        }
        return this.availableModels;
      })();
    }
    return this.modelsPromise;
  }

  private loadAgentModels() {
    // Migrate the legacy single default model to both agents on first run.
    const legacy = localStorage.getItem(this.legacyDefModelKey);
    if (legacy) {
      if (!localStorage.getItem(this.modelKeys.content)) {
        localStorage.setItem(this.modelKeys.content, legacy);
      }
      if (!localStorage.getItem(this.modelKeys.assistant)) {
        localStorage.setItem(this.modelKeys.assistant, legacy);
      }
      localStorage.removeItem(this.legacyDefModelKey);
    }

    (Object.keys(this.modelKeys) as AgentKey[]).forEach((agent) => {
      const modelString = localStorage.getItem(this.modelKeys[agent]);
      if (modelString) {
        this._models[agent] = JSON.parse(modelString);
      }
    });
  }

  getModel(agent: AgentKey): Model | undefined {
    return this._models[agent];
  }

  updateModel(agent: AgentKey, model?: Model) {
    if (model) {
      localStorage.setItem(this.modelKeys[agent], JSON.stringify(model));
    } else {
      localStorage.removeItem(this.modelKeys[agent]);
    }
    this._models[agent] = model;
  }

  private getGeminiTools(tools: McpTool[]): Array<Record<string, unknown>> {
    const functionDeclarations = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: toGeminiSchema(tool.inputSchema),
    }));

    return functionDeclarations.length > 0 ? [{ functionDeclarations }] : [];
  }

  async chat(
    request: Partial<ChatRequest>,
    tools?: McpTool[],
  ): Promise<ChatResponse> {
    const gemTools = this.getGeminiTools(tools ?? []);

    const userMsgContents =
      request.messages
        ?.filter((msg) => msg.role != 'system')
        .map((message) => ({
          role: message.role,
          parts: [{ text: message.content }],
        })) ?? [];
    const systemContents =
      request.messages
        ?.filter((msg) => msg.role == 'system')
        .map((message) => ({
          role: message.role,
          parts: [{ text: message.content }],
        })) ?? [];
    const InstructionParts: Part[] =
      systemContents.map((sc) => sc.parts).flat() ?? [];
    const reqParams: GenerateContentParameters = {
      model: this.ModelName,
      contents: userMsgContents,
      config: {
        systemInstruction: {
          role: 'system',
          parts: InstructionParts,
        },
        tools: gemTools,
      },
    };

    const result: GenerateContentResponse =
      await this.requireClient().models.generateContent(reqParams);
    const convertedResult = convertToChatResponse(result);
    return convertedResult;
  }

  async streamChat(
    request: Partial<ChatRequest>,
    tools?: McpTool[],
    abortController?: AbortController,
  ) {
    const gemTools = this.getGeminiTools(tools ?? []);
    const systemInstruction = request.messages
          ?.filter((m) => m.role === 'system')
          .map((m) => m.content)
          .join('\n');
    const otherMessages = request.messages?.filter((m)=>m.role!=='system');
    const stream = await this.requireClient().models.generateContentStream({
      model: request.model ?? this.ModelName,
      contents: (otherMessages ?? []).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        thought: msg.thinking != undefined,
        parts: [{ text: msg.content }],
      })),
      config: {
        systemInstruction: systemInstruction,
        tools: gemTools,
        abortSignal: abortController?.signal,
      },
    });
    return { stream: stream, provider: 'google' };
  }
}

export function convertToChatResponse(
  result: GenerateContentResponse,
): ChatResponse {
  const candidate = result.candidates?.[0];

  return {
    model: result.modelVersion ?? 'gemini',
    created_at: result.createTime ? new Date(result.createTime) : new Date(),
    message: {
      role: 'assistant',
      content: result.text ?? '',
      tool_calls: (result.functionCalls as GeminiFunctionCall[]).map(
        (fnCall) => {
          return {
            function: {
              name: fnCall.name!,
              arguments: fnCall.args,
            },
          };
        },
      ),
    },
    done: true,

    done_reason: candidate?.finishReason?.toString() ?? 'stop',

    total_duration: 0,
    load_duration: 0,

    prompt_eval_count: result.usageMetadata?.promptTokenCount ?? 0,

    eval_count: result.usageMetadata?.candidatesTokenCount ?? 0,

    prompt_eval_duration: 0,
    eval_duration: 0,
  };
}
type GeminiFunctionCall = {
  id?: string;
  name?: string;
  args?: any;
};
function toGeminiSchema(schema: unknown): Record<string, unknown> {
  const fallback = {
    type: 'OBJECT',
    properties: {},
  };

  if (!isRecord(schema)) {
    return fallback;
  }

  const next: Record<string, unknown> = {};

  if (typeof schema['type'] === 'string') {
    next['type'] = schema['type'].toUpperCase();
  }

  if (typeof schema['description'] === 'string') {
    next['description'] = schema['description'];
  }

  if (Array.isArray(schema['required'])) {
    next['required'] = schema['required'];
  }

  if (Array.isArray(schema['enum'])) {
    next['enum'] = schema['enum'];
  }

  if (isRecord(schema['properties'])) {
    next['properties'] = Object.fromEntries(
      Object.entries(schema['properties']).map(([key, value]) => [
        key,
        toGeminiSchema(value),
      ]),
    );
  }

  if (isRecord(schema['items'])) {
    next['items'] = toGeminiSchema(schema['items']);
  }

  return Object.keys(next).length > 0 ? next : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
