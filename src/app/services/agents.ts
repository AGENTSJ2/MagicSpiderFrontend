import { Injectable } from '@angular/core';
import { OllamaChatService } from './Ollama.service';
import { Subject } from 'rxjs';
import { AbortableAsyncIterator, ChatResponse, Message, Tool } from 'ollama';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { McpService } from './mcp.service';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { InternalMcpError } from '../features/slide-presentation/MCP/mcp.erros';
import { GeminiService } from './gemini.service';

@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  private chatService = new GeminiService();
  constructor(
    // private chatService: OllamaChatService,
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
    `The slide is a canvas of Height 750 Width 1333 so u can use x and y with in this limit and position`,
    'You can use them to create and update slide u can use each tool appropriately',
    'you can call multiple tools at an time if u need as an list',
    'If you believe that task is complete then make the response function call list empty so that we can stop gracefully',
    'Never continue issuing tool calls after the task is complete.'
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
        content: `Slide Description ${params.slideContent}`,
      },
    ];
    for (let i = 0; i < 20; i++) {
      const slideJson = JSON.stringify(
        params.presentation.slides.map((sl) => sl.toJson()),
      );
      const response: ChatResponse = await this.chatService.chat(
        {
          messages: [
            ...messages,
            {
              role: 'user',
              content: `Latest Slide JSON ${slideJson}`,
            },
          ],
          tools: tools.map((tl) => convertMcpToolToOpenAiTool(tl)),
        },
        tools,
      );
      console.log(response.message.tool_calls);
      const ackMessage: Message = {
        role: 'system',
        content: '',
      };
      for (let tool of response.message.tool_calls ?? []) {
        try {
          await mcp.callTool({
            toolName: tool.function.name,
            args: tool.function.arguments,
          });
          ackMessage.content += `Successfully called[${tool.function.name}]\n`;
        } catch (error) {
          ackMessage.content += `An Error occur while calling [${tool.function.name}] Error: ${(error as InternalMcpError).message}\n`;
          console.log(error);
        }
      }
      messages.push(ackMessage);
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
