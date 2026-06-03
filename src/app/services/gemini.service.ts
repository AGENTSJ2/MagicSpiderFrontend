import { Injectable } from '@angular/core';
import {
  GenerateContentParameters,
  GenerateContentResponse,
  GoogleGenAI,
  Part,
} from '@google/genai';
import { ChatRequest, ChatResponse } from 'ollama';
import { OllamaChatService } from './Ollama.service';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly API_KEY: string = 'AQ.Ab8RN6J6Tj9SD8OjYCOW3fuuGaarCrlIUGNkLE-mqkPDOEg4bw';
  private readonly ModelName: string = 'gemini-3.5-flash';
  private gemini: GoogleGenAI;

  constructor() {
    this.gemini = new GoogleGenAI({
      apiKey: this.API_KEY,
    });
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
      await this.gemini.models.generateContent(reqParams);
    const convertedResult = convertToChatResponse(result);
    return convertedResult;
  }
  async streamChat(request: Partial<ChatRequest>) {
    return new OllamaChatService().streamChat(request);
  }

  private getGeminiTools(tools: McpTool[]): Array<Record<string, unknown>> {
    const functionDeclarations = tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: toGeminiSchema(tool.inputSchema),
    }));

    return functionDeclarations.length > 0 ? [{ functionDeclarations }] : [];
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

function extractText(result: unknown): string {
  if (!isRecord(result)) {
    return '';
  }

  const candidates = result['candidates'];
  if (!Array.isArray(candidates)) {
    return '';
  }

  return candidates
    .flatMap((candidate) => {
      if (!isRecord(candidate) || !isRecord(candidate['content'])) {
        return [];
      }

      const parts = candidate['content']['parts'];
      return Array.isArray(parts) ? parts : [];
    })
    .map((part) =>
      isRecord(part) && typeof part['text'] === 'string' ? part['text'] : '',
    )
    .filter(Boolean)
    .join('\n');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
