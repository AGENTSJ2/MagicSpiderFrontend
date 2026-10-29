import { Tool } from 'ollama';
import { Subject } from 'rxjs';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { LlmChunk } from '../../services/llm-provider';

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
  stream: AsyncIterable<LlmChunk>,
): Promise<{ thoughts: string; contents: string }> {
  let thoughts: string = '';
  let contents: string = '';
  try {
    for await (const chunk of stream) {
      if (chunk.thinking) {
        thoughts += chunk.thinking;
        responseEvent.next({
          action: AgentState.thinking,
          message: chunk.thinking,
        });
      }
      if (chunk.content) {
        contents += chunk.content;
        responseEvent.next({
          action: AgentState.content,
          message: chunk.content,
        });
      }
      for (const toolCall of chunk.toolCalls ?? []) {
        responseEvent.next({
          action: AgentState.function,
          message: '',
          functionCall: toolCall,
        });
      }
    }
    return { thoughts, contents };
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