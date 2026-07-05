import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { GeminiService } from './gemini.service';
import blobService from './blob.service';
import { AgentInActionStages, AgentState, AgentStreamEvent, InvokeEnabledStages, pipeResponseToStream } from '../agents/core/utility';

@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  
  private readonly ContentCreatorPrompt = [
    'You are an slide content creator your output should be a html format that support quill',
    'Add breaks <br></br> between slides and headlines and add line height enough such that content wont look Congested but dont overdo',
    'Your Response should not contain any user addressing or other junk just slide data',
    'An small summary of slides generated with side number topics are preferred so people can get an summary before going through the whole slide',
  ].join(' ');
  

  private readonly ImageGeneratorPrompt = [
    'Generate a single high-quality visual based on the user request.',
    'The output should be clear, professional, and suitable for presentations, documents, dashboards, or other user-facing content.',
    'Use an appropriate visual style for the request (illustration, diagram, concept art, UI mockup, infographic, etc.).',
    'Keep the composition clean and focused, with minimal unnecessary elements.',
    'Prefer a transparent or simple background unless the user requests otherwise.',
  ].join(' ');

  constructor(
    private chatService: GeminiService,
  ) {
    this.contentCreatorStream.subscribe((event) => {
      this.contentCreatorState = event.action;
    });
    this.imageGeneratorStream.subscribe((event) => {
      this.imageGeneratorState = event.action;
    });
  }

  private contentCreatorSubject: Subject<AgentStreamEvent> = new Subject();
  private interruptContentCreatorSubject: Subject<boolean> = new Subject();
  private contentInterruptSub?:Subscription;
  contentCreatorStream: Observable<AgentStreamEvent> = this.contentCreatorSubject.asObservable();
  contentCreatorState: AgentState = AgentState.idle;
  
  private async ContentCreatorAgent(params: {
    userProblemStatement: string;
    previousContent: string;
  }) {
    if(params.userProblemStatement.length == 0)
    {
      return;
    }
    const abortController = new AbortController();
    const localContentCreatorSubject = new Subject<AgentStreamEvent>();
    try {
      localContentCreatorSubject.subscribe((ev)=>{
        this.contentCreatorSubject.next(ev);
      });
      localContentCreatorSubject.next({
        action:AgentState.invoked,
        message:"Content creator has been invoked"
      })
      this.contentInterruptSub?.unsubscribe();
      this.interruptContentCreatorSubject.subscribe((ev) => {
        if (ev) {
          if(ev)
          {
            abortController.abort();
          }
        }
      });
      // Agent working
      const { stream, provider } = await this.chatService.streamChat(
        {
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
        },
        [],
        abortController,
      );
      await pipeResponseToStream(localContentCreatorSubject, stream, provider);
      this.contentCreatorSubject.next({
        action: AgentState.done,
        message: "Completed",
      });
    } catch (error) {
      this.contentCreatorSubject.next({
        action: AgentState.error,
        message: error?.toString() ?? 'Unknown error',
      });
    }
    finally
    {
      localContentCreatorSubject.complete();
      this.contentInterruptSub?.unsubscribe();
    }

  }

  triggerContentCreator(params: {
    userProblemStatement: string;
    previousContent: string;
  }) {
    if (AgentInActionStages.includes(this.contentCreatorState)) {
      this.interruptContentCreator();
    }
    if (InvokeEnabledStages.includes(this.contentCreatorState)) {
      this.ContentCreatorAgent(params);
    }
  }

  interruptContentCreator() {
    this.interruptContentCreatorSubject.next(true);
  }

  private imageGeneratorSubject: Subject<AgentStreamEvent> = new Subject();
  private interruptImageGeneratorSubject: Subject<boolean> = new Subject();
  private imageInterruptSub?: Subscription;
  imageGeneratorStream: Observable<AgentStreamEvent> =
    this.imageGeneratorSubject.asObservable();
  imageGeneratorState: AgentState = AgentState.idle;

  private async ImageGeneratorAgent(params: {
    prompt: string;
    presentation: Presentation;
  }) {
    if (params.prompt.trim().length == 0) {
      return;
    }
    const abortController = new AbortController();
    try {
      this.imageGeneratorSubject.next({
        action: AgentState.invoked,
        message: 'Image generator has been invoked',
      });

      const activeSlide = params.presentation.getActiveSlide;
      if (!activeSlide) {
        throw new Error('Select a slide before generating an image.');
      }

      this.imageInterruptSub?.unsubscribe();
      this.imageInterruptSub = this.interruptImageGeneratorSubject.subscribe(
        (ev) => {
          if (ev) {
            abortController.abort();
          }
        },
      );

      this.imageGeneratorSubject.next({
        action: AgentState.thinking,
        message: 'Generating image...',
      });

      const image = await this.chatService.generateImage(
        [this.ImageGeneratorPrompt, params.prompt].join('\n'),
        abortController,
      );

      const appImage = blobService.addImage(image.dataUrl,image.text);

      this.imageGeneratorSubject.next({
        action: AgentState.content,
        message: image.text || 'Image added to the active slide.',
        attachment:appImage
      });
      this.imageGeneratorSubject.next({
        action: AgentState.done,
        message: 'Completed',
      });
    } catch (error) {
      this.imageGeneratorSubject.next({
        action: AgentState.error,
        message: error?.toString() ?? 'Unknown error',
      });
    } finally {
      this.imageInterruptSub?.unsubscribe();
    }
  }

  triggerImageGenerator(params: {
    prompt: string;
    presentation: Presentation;
  }) {
    if (AgentInActionStages.includes(this.imageGeneratorState)) {
      this.interruptImageGenerator();
    }
    if (InvokeEnabledStages.includes(this.imageGeneratorState)) {
      this.ImageGeneratorAgent(params);
    }
  }

  interruptImageGenerator() {
    this.interruptImageGeneratorSubject.next(true);
  }
  
}


