import { ChatRequest } from 'ollama';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types';

export type AgentKey = 'content' | 'assistant' | 'architect' | 'image';

export type ProviderId = 'gemini' | 'ollama';

export enum LlmThinkingLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface LlmModel {
  name?: string;
  displayName?: string;
}

export interface LlmToolCall {
  name: string;
  args: any;
}

/** Provider-neutral piece of a model response, consumed by pipeResponseToStream. */
export interface LlmChunk {
  thinking?: string;
  content?: string;
  toolCalls?: LlmToolCall[];
}

export interface GeneratedImage {
  dataUrl: string;
  text: string;
}

export abstract class LlmProvider {
  abstract readonly id: ProviderId;
  abstract readonly label: string;
  abstract readonly isConfigured: boolean;

  abstract loadModels(): Promise<LlmModel[]>;
  abstract getModel(agent: AgentKey): LlmModel | undefined;
  abstract updateModel(agent: AgentKey, model?: LlmModel): void;

  abstract streamChat(
    request: Partial<ChatRequest>,
    tools?: McpTool[],
    abortController?: AbortController,
    thinkingLevel?: LlmThinkingLevel,
  ): Promise<AsyncIterable<LlmChunk>>;

  abstract generateImage(
    prompt: string,
    abortController?: AbortController,
  ): Promise<GeneratedImage>;
}
