import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatResponse, Message, Tool } from 'ollama';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Tool as McpTool } from '@modelcontextprotocol/sdk/types.js';
import { InternalMcpError } from '../features/slide-presentation/MCP/mcp.erros';
import { GeminiService } from './gemini.service';
import { GenerateContentResponse } from '@google/genai';
import type { AbortableAsyncIterator, ToolCall } from 'ollama';
import { McpHub } from '../features/slide-presentation/MCP/mcp_hub';
@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  constructor(
    private chatService: GeminiService,
    private mcpService: McpHub,
  ) {}

  private readonly ContentCreatorPrompt = [
    'You are an slide content creator your output should be a html format that support quill',
    'Add breaks <br></br> between slides and headlines and add line height enough such that content wont look Congested but dont overdo',
    'Your Response should not contain any user addressing or other junk just slide data',
    'An small summary of slides generated with side number topics are preferred so people can get an summary before going through the whole slide',
  ].join(' ');
  async ContentCreator(params: {
    userProblemStatement: string;
    previousContent: string;
  }) {
    const responseEvent = new Subject<AgentStreamEvent>();
    const interrupt = new Subject<boolean>();

    const { stream, provider } = await this.chatService.streamChat({
      model: this.chatService.getModel('content')?.name,
      messages: [
        {
          role: 'system',
          content: this.ContentCreatorPrompt,
        },
        ...(params.previousContent.length != 0
          ? [{ role: 'assistant', content: params.previousContent }]
          : []),
        {
          role: 'user',
          content: params.userProblemStatement,
        },
      ],
    });
    this.pipeResponseToStream(responseEvent, stream, provider);
    interrupt.subscribe((ev) => {
      if (ev) {
        if (provider == 'ollama') {
          (stream as any).abort();
        }
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
    'Never continue issuing tool calls after the task is complete.',
    'The Slide style should be modern and attractive ato look at',
  ].join(' ');

  async MagicSpiderStream(params: {
    slideContent: string;
    userComment: string;
    presentation: Presentation;
    responseStream: Subject<AgentStreamEvent>;
    interrupt: Subject<boolean>;
  }) {
    try {
      let stop: boolean = false;
      const abortController = new AbortController();
      params.interrupt.subscribe((intr) => {
        stop = intr;
        if(stop)
        {
          console.log("trying to stope");
          
          abortController.abort();
        }
      });

      params.responseStream.next({
        action: AgentState.invoked,
        message: 'Magic Spider has been called',
      });

      const tools = await this.mcpService.listTools();
      const messages = [
        {
          role: 'system',
          content: this.MagicSpiderPrompt,
        },
        {
          role: 'user',
          content: `Slide Description ${params.slideContent}`,
        },
        {
          role: 'user',
          content: '',
        },
      ];
      while(!stop) {
        const responseEvent = new Subject<AgentStreamEvent>();
        const slideJson = JSON.stringify(
          params.presentation.slides.map((sl) => sl.toJson()),
        );
        const response = await this.chatService.streamChat(
          {
            model: this.chatService.getModel('assistant')?.name,
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
          abortController
        );

        const toolCalls: ToolCall[] = [];
        responseEvent.subscribe((event) => {
          params.responseStream.next(event);
          if (event.functionCall) {
            toolCalls.push({
              function: {
                name: event.functionCall.name!,
                arguments: event.functionCall.args,
              },
            });
          }
        });
        await this.pipeResponseToStream(
          responseEvent,
          response.stream,
          response.provider,
        );
        responseEvent.complete();
        if (toolCalls.length == 0) {
          console.log('stopped gracefully');
          break;
        }
        const ackMessage = await this.invokeTools(toolCalls);
        messages.push(ackMessage);
      }
      params.responseStream.next({
        action: AgentState.done,
        message: 'Success fully stopped',
      });
    } catch (error) {
      params.responseStream.next({
        action: AgentState.error,
        message: error?.toString() ?? 'Unknown error',
      });
    }
  }

  private async pipeResponseToStream(
    responseEvent: Subject<AgentStreamEvent>,
    stream:
      | AbortableAsyncIterator<ChatResponse>
      | AsyncGenerator<GenerateContentResponse, any, any>,
    provider: string,
  ) {
    try {
      if (provider == 'ollama') {
        for await (const chunk of stream as AbortableAsyncIterator<ChatResponse>) {
          if (chunk.message.thinking) {
            responseEvent.next({
              action: AgentState.thinking,
              message: chunk.message.thinking,
            });
          }

          if (chunk.message.content) {
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
          for (const part of parts) {
            if (part.thought) {
              responseEvent.next({
                action: AgentState.thinking,
                message: part.text ?? '',
              });
              continue;
            }
            if (part.functionCall) {
              responseEvent.next({
                action: AgentState.function,
                message:"",
                functionCall: part.functionCall,
              });
              continue;
            }
            responseEvent.next({
              action: AgentState.content,
              message: part.text!,
            });
          }
        }
      }

      responseEvent.complete();
    } catch (error) {
      responseEvent.error(error);
    }
  }

  private async invokeTools(toolCalls: ToolCall[]): Promise<Message> {
    const ackMessage: Message = {
      role: 'system',
      content: '',
    };
    for (let tool of toolCalls) {
      try {
        await this.mcpService.callTool({
          toolName: tool.function.name,
          args: tool.function.arguments,
        });
        ackMessage.content += `Successfully called[${tool.function.name}]\n`;
      } catch (error) {
        ackMessage.content += `An Error occur while calling [${tool.function.name}] Error: ${(error as InternalMcpError).message}\n`;
        console.log(error);
      }
    }
    return ackMessage;
  }
}

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
