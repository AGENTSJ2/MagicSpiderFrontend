import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Model } from '@google/genai';
import { AgentState, AgentStreamEvent, LLM_Agents } from '../../../../services/agents';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { PresentationService } from '../../../../services/konva.services/presentation.service';
import { GeminiService } from '../../../../services/gemini.service';


@Component({
  selector: 'app-aislide-description',
  templateUrl: './aislide-description.component.html',
  styleUrl: './aislide-description.component.scss',
})
export class AISlideDescriptionComponent {
  @Input() presentation!: Presentation;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  problemStatement?: string = '';
  thinkingText = '';
  errorMessage = '';
  AgentState = AgentState;
  private streamSub?: Subscription;
  private interrupt$ = new Subject<boolean>();
  @ViewChild('genContent')
  genContentElement!: ElementRef;
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    public agentService: LLM_Agents,
    public workspaceController: WorkspaceController,
    private presentationService:PresentationService,
    private geminiService: GeminiService
  ) {}

  get contentModel(): Model | undefined {
    return this.geminiService.getModel('content');
  }

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],

      [{ list: 'ordered' }, { list: 'bullet' }],

      ['blockquote', 'code-block'],

      ['link', 'image'],
    ],
  };

  open(): void {
    this.workspaceController.showSlideDescription = true;
  }

  handleCancel(): void {
    this.workspaceController.showSlideDescription = false;
    this.reset();
  }

  reset(): void {
    this.streamSub?.unsubscribe();
    this.interrupt$.next(true);
    this.problemStatement = '';
    this.thinkingText = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  // ── Generate ──────────────────────────────────────────────────────────────

  async trigger(): Promise<void> {
    this.thinkingText = '';
    const prevContent = this.workspaceController.scratchBookContent;
    this.workspaceController.scratchBookContent = '';
    this.errorMessage = '';

    try {
      this.agentService.triggerContentCreator({
        userProblemStatement: this.problemStatement!.trim(),
        previousContent: prevContent,
      });
      this.streamSub = this.agentService.contentCreatorStream.subscribe({
        next: (event: AgentStreamEvent) => {
          if (event.action === 'thinking') {
            this.thinkingText += event.message;
            this.scrollContOnValue(this.thinkingBoxElement?.nativeElement)
          } else if (event.action === 'content') {
            this.workspaceController.scratchBookContent += event.message;
            this.scrollContOnValue(this.genContentElement?.nativeElement)
          } else if (event.action === AgentState.error) {
            this.errorMessage = event.message;
            this.workspaceController.handleAgentError(event.message);
          }
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.errorMessage =
            err instanceof Error
              ? err.message
              : 'Stream error. Please try again.';
          this.workspaceController.handleAgentError(err);
          this.cdr.detectChanges();
        },
        complete: () => {
          this.cdr.detectChanges();
        },
      });
    } catch (err: unknown) {
      this.errorMessage =
        err instanceof Error ? err.message : 'Failed to start generation.';
      this.cdr.detectChanges();
      console.log(err);
      
    } finally {
      this.problemStatement = '';
    }
  }
  scrollContOnValue(el:any) {

    if (!el) {
      return;
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const threshold = 100; // px

    if (distanceFromBottom <= threshold) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
    this.interrupt$.complete();
  }

  handleInvokeMagicSpider() {
    this.workspaceController.attachScratchBook = true;
    this.workspaceController.showMagicSpider();
    this.close.emit(true);
  }
  saveTimeOut:any;
  handleContentChange()
  {
    clearTimeout(this.saveTimeOut);
    this.saveTimeOut = setTimeout(()=>{
      this.presentationService.saveScratchBook(this.presentation.id,this.workspaceController.scratchBookContent);
    },1000);

  }
  isAgentIntractable()
  {
    return this.agentService.InvokeEnabledStages.includes(this.agentService.contentCreatorState);
  }
  isAgentInaction()
  {
    return this.agentService.AgentInActionStages.includes(this.agentService.contentCreatorState);
  }
}
