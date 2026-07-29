import { Injectable } from '@angular/core';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { AgentInActionStages, AgentState, AgentStreamEvent, InvokeEnabledStages } from './core/utility';
import { Observable, Subject, Subscription } from 'rxjs';
import blobService from '../services/blob.service';
import { GeminiService } from '../services/gemini.service';
import { OllamaChatService } from '../services/Ollama.service';

@Injectable({
  providedIn: 'root',
})
export class ImageGeneratorAgent {
  private imageGeneratorSubject: Subject<AgentStreamEvent> = new Subject();
  private interruptImageGeneratorSubject: Subject<boolean> = new Subject();
  private imageInterruptSub?: Subscription;
  imageGeneratorStream: Observable<AgentStreamEvent> =
    this.imageGeneratorSubject.asObservable();
  imageGeneratorState: AgentState = AgentState.idle;
  constructor(private chatService: OllamaChatService) {
    this.imageGeneratorStream.subscribe((event) => {
      this.imageGeneratorState = event.action;
    });
  }

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

      const image :any = await this.chatService.generateImage(
        [ImageGeneratorPrompt, params.prompt].join('\n'),
        abortController,
      );

      const appImage = blobService.addImage(image.dataUrl, image.text);

      this.imageGeneratorSubject.next({
        action: AgentState.content,
        message: image.text || 'Image added to the active slide.',
        attachment: appImage,
      });
      this.imageGeneratorSubject.next({
        action: AgentState.done,
        message: 'Completed',
      });
    } catch (error) {
      console.error(error);
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
const ImageGeneratorPrompt = [
  'Generate a single high-quality visual based on the user request.',
  'The output should be clear, professional, and suitable for presentations, documents, dashboards, or other user-facing content.',
  'Use an appropriate visual style for the request (illustration, diagram, concept art, UI mockup, infographic, etc.).',
  'Keep the composition clean and focused, with minimal unnecessary elements.',
  'Prefer a transparent or simple background unless the user requests otherwise.',
].join(' ');
