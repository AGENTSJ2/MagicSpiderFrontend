import { Injectable } from '@angular/core';
import { OllamaChatService } from './OllamaChatService';
import { Subject } from 'rxjs';
import { AbortableAsyncIterator, ChatResponse, Tool } from 'ollama';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { MCP } from '../features/slide-presentation/MCP/mcp_server';
import { McpService } from './mcp.service';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';

@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  constructor(
    private chatService: OllamaChatService,
    private mcpService: McpService,
  ) {}

  private readonly ContentCreatorPrompt = [
    'You are an slide content creator your output should be a markdown of slide content ',
    'Your Response should not contain any user addressing or other junk just slide data',
    'An small summary of slides generated with side number topics are preferred so people can get an summary before going through the whole slide',
  ].join(' ');
  async ContentCreator(params: { userProblemStatement: string }) {
    const responseEvent = new Subject<AgentStreamEvent>();
    const interrupt = new Subject<boolean>();

    const stream = await this.chatService.streamChat({
      messages: [
        {
          role: 'system',
          content: this.ContentCreatorPrompt,
        },
        {
          role: 'user',
          content: params.userProblemStatement,
        },
      ],
    });
    this.pipeResponseToStream(responseEvent, stream);
    interrupt.subscribe((ev) => {
      if (ev) {
        stream.abort();
      }
    });
    return { responseEvent, interrupt };
  }
  private readonly MagicSpiderPrompt = [
    'You are an Agent who can access slide creation tools that have been provided to u ',
    'You can use them to create and update slide u can use each tool appropriately',
    'Tou can call multiple tools at an time if u need as an list'
  ].join(' ');
  async MagicSpider(params: {
    slideContent: string;
    presentation: Presentation;
  }) {
    const mcp = this.mcpService.getPresentationMcp(params.presentation);
    const tools = mcp.listTools();
    const messages = [
      {
        role: 'system',
        content: this.MagicSpiderPrompt,
      },
      {
        role: 'user',
        content: params.slideContent,
      },
    ];
    for (let i = 0; i < 10; i++) {
      const response: ChatResponse = await this.chatService.chat({
        messages: messages,
        tools: tools.map((tl) => convertMcpToolToOpenAiTool(tl)),
      });
      console.log(response.message.tool_calls);
      messages.push(response.message);
      for (let tool of response.message.tool_calls ?? []) {
        await mcp.callTool({
          toolName: tool.function.name,
          args: tool.function.arguments,
        });
      }
    }
  }

  private async pipeResponseToStream(
    responseEvent: Subject<any>,
    stream: AbortableAsyncIterator<ChatResponse>,
  ) {
    try {
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

      responseEvent.complete();
    } catch (error) {
      responseEvent.error(error);
    }
  }
}
export interface AgentStreamEvent {
  action: 'thinking' | 'content';
  message: string;
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
