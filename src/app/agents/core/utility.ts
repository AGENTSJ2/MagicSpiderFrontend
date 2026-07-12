import { FinishReason, GenerateContentResponse } from '@google/genai';
import { AbortableAsyncIterator, ChatResponse, Tool } from 'ollama';
import { Subject } from 'rxjs';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';

export enum AgentState {
  invoked = 'invoked',
  thinking = 'thinking',
  content = 'content',
  function = 'function',
  done = 'done',
  error = 'error',
  idle = 'idle',
}
export interface AgentStreamEvent {
  action: AgentState;
  message: string;
  functionCall?: any;
  attachment?: any;
}
export const InvokeEnabledStages = [
  AgentState.idle,
  AgentState.error,
  AgentState.done,
];
export const AgentInActionStages = [
  AgentState.content,
  AgentState.function,
  AgentState.thinking,
  AgentState.invoked,
];

export async function pipeResponseToStream(
  responseEvent: Subject<AgentStreamEvent>,
  stream:
    | AbortableAsyncIterator<ChatResponse>
    | AsyncGenerator<GenerateContentResponse, any, any>,
  provider: string,
): Promise<{ thoughts: string; contents: string }> {
  let thoughts: string = '';
  let contents: string = '';
  try {
    if (provider == 'ollama') {
      for await (const chunk of stream as AbortableAsyncIterator<ChatResponse>) {
        if (chunk.message.thinking) {
          thoughts += chunk.message.thinking;
          responseEvent.next({
            action: AgentState.thinking,
            message: chunk.message.thinking,
          });
        }
        if (chunk.message.content) {
          contents += chunk.message.content;
          responseEvent.next({
            action: AgentState.content,
            message: chunk.message.content,
          });
        }
      }
    } else {
      for await (const chunk of stream as AsyncGenerator<
        GenerateContentResponse,
        any,
        any
      >) {
        const parts = chunk.candidates?.[0]?.content?.parts ?? [];
        const reason: any = chunk!.candidates!.at(0)!.finishReason;
        if (
          reason == FinishReason.MALFORMED_FUNCTION_CALL ||
          reason == 'MALFORMED_RESPONSE'
        ) {
          throw Error(reason);
        }
        for (const part of parts) {
          if (part.thought) {
            thoughts += part.text;
            responseEvent.next({
              action: AgentState.thinking,
              message: part.text ?? '',
            });
            continue;
          }
          if (part.functionCall) {
            responseEvent.next({
              action: AgentState.function,
              message: '',
              functionCall: part.functionCall,
            });
            continue;
          }
          contents += part.text;
          responseEvent.next({
            action: AgentState.content,
            message: part.text!,
          });
        }
      }
    }
    return { thoughts, contents };
  } catch (error) {
    throw error;
  } finally {
    responseEvent.complete();
  }
}

export function isApiKeyError(error: unknown): boolean {
  const message = (
    typeof error === 'string'
      ? error
      : ((error as any)?.message ?? String(error ?? ''))
  ).toLowerCase();
  if (!message) {
    return false;
  }
  return [
    'api key',
    'api_key',
    'api-key',
    'api_key_invalid',
    'permission_denied',
    'permission denied',
    'unauthenticated',
    'unauthorized',
    '401',
    '403',
  ].some((needle) => message.includes(needle));
}
export function convertMcpToolToOpenAiTool(mcpTool: McpTool): Tool {
  return {
    type: 'function',
    function: {
      name: mcpTool.name,
      description: mcpTool.description,
      type: 'function',
      parameters: {
        type: mcpTool.inputSchema.type,
        properties: mcpTool.inputSchema.properties ?? {},
        required: mcpTool.inputSchema.required ?? [],
        $defs: mcpTool.inputSchema['$defs'],
        items: mcpTool.inputSchema['items'],
      },
    },
  };
}
export function getAgentErrorMessage(error: unknown): string {
  if (!isApiKeyError(error)) {
    return "Something Went";
  }
  return  'An API key is required. Please add your API key in AI Settings.'
}