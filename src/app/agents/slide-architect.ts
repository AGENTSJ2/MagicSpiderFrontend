import { Subject } from 'rxjs';
import { Message } from 'ollama';
import { DesignPrinciplesPrompt } from '../features/slide-presentation/MCP/prompts/designPrinciples';
import { Injectable } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { AgentStreamEvent, pipeResponseToStream, sanitizeJson } from './core/utility';
import { waitForMilliseconds } from '../core/utilities';
import { MAX_RETRY, RETRY_TIME_OUT_MS } from './core/constants';
import { ThinkingLevel } from '@google/genai';
import { PresentationArchitecture } from './core/model';

@Injectable({
  providedIn: 'root',
})
export class SlideArchitectAgent {
  constructor(private chatService: GeminiService) {}

  private parseArchitecture(raw: string): PresentationArchitecture {
    const sanitized = sanitizeJson(raw);
    const start = sanitized.indexOf('{');
    const end = sanitized.lastIndexOf('}');
    if (start < 0 || end <= start) {
      throw new Error('Slide Architect did not return an architecture JSON');
    }
    const architecture = JSON.parse(
      sanitized.slice(start, end + 1),
    ) as PresentationArchitecture;
    if (!architecture?.presentation?.slides?.length) {
      throw new Error('Slide Architect returned an empty architecture');
    }
    return architecture;
  }

  async run(
    params: {
      userPrompt: string;
      scratchBook?: string;
      currentSlideJson?: string;
      imagesAvailable?: string;
      magicSpiderEvent?:Subject<AgentStreamEvent>
    },
    abortController?: AbortController,
  ): Promise<PresentationArchitecture> {
    const messages: Message[] = [
      {
        role: 'system',
        content: SlideArchitectPrompt,
      },
      ...(params.scratchBook?.length
        ? [{ role: 'user', content: `Scratch Book ${params.scratchBook}` }]
        : []),
      ...(params.currentSlideJson?.length
        ? [
            {
              role: 'user',
              content: `Current Slide JSON ${params.currentSlideJson}`,
            },
          ]
        : []),
      ...(params.imagesAvailable?.length
        ? [
            {
              role: 'user',
              content: `Images Available in system ${params.imagesAvailable}`,
            },
          ]
        : []),
      {
        role: 'user',
        content: params.userPrompt,
      },
    ];

    let completed = false;
    let retry = 0;
    let completedContent:string = "";

    while(!completed && retry < MAX_RETRY && !abortController?.signal.aborted) {
      try {
        const responseEvent = new Subject<AgentStreamEvent>();
        responseEvent.subscribe((event)=>{
          params.magicSpiderEvent?.next(event);
        });
        
        const { stream, provider } = await this.chatService.streamChat(
          {
            model: this.chatService.getModel('architect')?.name,
            messages: messages,
          },
          [],
          abortController,
          ThinkingLevel.HIGH
        );

        const { contents } = await pipeResponseToStream(
          responseEvent,
          stream,
          provider,
        );
        completed = true;
        completedContent = contents;    
      } catch (error) {
        retry++
        await waitForMilliseconds(RETRY_TIME_OUT_MS);
      }
    }
    return this.parseArchitecture(completedContent);
  }
}
const SlideArchitectPrompt = [
  'You are an Best in class Slide Architect a presentation design architect',
  'Your job is to architect the design of the slides NOT to implement them, an implementation agent will execute your plan slide by slide using slide tools',
  'Your are accountable to your Plan  so thing this through',
  'You may receive a scratch book holding the slide contents, a user prompt and the JSON of the current slides',
  `The slide is a canvas of Height 750 Width 1333`,
  'Respond with STRICTLY a single JSON object with no markdown fences and no commentary in this exact shape :',
  '{"presentation":{"slides":[{"slideId":"only if the slide already exists","components":[{"id":"only if the component already exists","task":"changes that should be done with detailed but concise things to do"}]}]}}',
  'Your generated architecture will be used by slide worker agents. Each agent only has access to the architecture for a single slide, so include all necessary details within that slide s architecture. Keep the context concise, precise, and self-contained.',
  'For existing slides include their slideId from the provided JSON and omit slideId for new slides that must be created',
  'For existing components include their id and omit id for new components, a task may also ask to delete an existing component by its id',
  'If the request modifies existing content, return only the affected slides and components. Include their existing slideId and component id, and do not include unchanged slides or components.',
  'If the user has uploaded images, incorporate them into the presentation where appropriate. A well-designed presentation should make effective use of relevant user-provided images.',
  'Each task must be self contained and actionable : state the component type (text, shape or image), its content, position x y, size, colors, font details and z order so the implementer needs no other context',
  'Order the components of a slide background first then foreground',
  'The Slide style should be modern and attractive to look at',
  DesignPrinciplesPrompt,
].join(' ');
