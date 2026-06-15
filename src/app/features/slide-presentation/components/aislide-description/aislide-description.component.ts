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
import { AgentStreamEvent, LLM_Agents } from '../../../../services/agents';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';

enum StreamPhase {
  idle = 'Idle',
  thinking = 'Thinking',
  content = 'Content',
  done = 'Done',
  error = 'Error',
}

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
  contentText = '';
  phase: StreamPhase = StreamPhase.idle;
  StreamPhase = StreamPhase;
  errorMessage = '';

  private streamSub?: Subscription;
  private interrupt$ = new Subject<boolean>();
  @ViewChild('genContent')
  genContentElement!: ElementRef;
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private agentService: LLM_Agents,
    public workspaceController: WorkspaceController,
  ) {}

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],

      [{ list: 'ordered' }, { list: 'bullet' }],

      ['blockquote', 'code-block'],

      ['link', 'image'],
    ],
  };

  get phaseTagColor(): string {
    const map: Record<StreamPhase, string> = {
      [StreamPhase.idle]: 'default',
      [StreamPhase.thinking]: 'gold',
      [StreamPhase.content]: 'blue',
      [StreamPhase.done]: 'green',
      [StreamPhase.error]: 'red',
    };
    return map[this.phase];
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  open(): void {
    this.workspaceController.showSlideDescription = true;
  }

  handleCancel(): void {
    if (
      this.phase === StreamPhase.thinking ||
      this.phase === StreamPhase.content
    )
      return;
    this.workspaceController.showSlideDescription = false;
    this.reset();
  }

  reset(): void {
    this.streamSub?.unsubscribe();
    this.interrupt$.next(true);
    this.problemStatement = '';
    this.thinkingText = '';
    this.contentText = '';
    this.phase = StreamPhase.idle;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  // ── Generate ──────────────────────────────────────────────────────────────

  async generate(): Promise<void> {
    if (
      !this.problemStatement?.trim() ||
      [StreamPhase.thinking , StreamPhase.content].includes(this.phase)
    ) {
      return;
    }

    this.thinkingText = '';
    const prevContent = this.contentText;
    this.contentText = '';
    this.phase = StreamPhase.thinking;
    this.errorMessage = '';

    try {
      const stream$ = await this.agentService.ContentCreator({
        userProblemStatement: this.problemStatement.trim(),
        previousContent: prevContent,
      });

      this.streamSub = stream$.responseEvent.subscribe({
        next: (event: AgentStreamEvent) => {
          if (event.action === 'thinking') {
            this.thinkingText += event.message;
            if (this.phase !== StreamPhase.thinking) {
              this.phase = StreamPhase.thinking;
            }
            this.thinkingBoxElement?.nativeElement.scrollTo({
              top: this.thinkingBoxElement.nativeElement.scrollHeight,
              behavior: 'smooth',
            });
          } else if (event.action === 'content') {
            this.phase = StreamPhase.content;
            this.contentText += event.message;
            this.genContentElement?.nativeElement.scrollTo({
              top: this.genContentElement.nativeElement.scrollHeight,
              behavior: 'smooth',
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.phase = StreamPhase.error;
          this.errorMessage =
            err instanceof Error
              ? err.message
              : 'Stream error. Please try again.';
          this.cdr.detectChanges();
        },
        complete: () => {
          this.phase = StreamPhase.done;
          this.cdr.detectChanges();
        },
      });
    } catch (err: unknown) {
      this.phase = StreamPhase.error;
      this.errorMessage =
        err instanceof Error ? err.message : 'Failed to start generation.';
      this.cdr.detectChanges();
    } finally {
      this.problemStatement = '';
    }
  }

  // ── Copy ──────────────────────────────────────────────────────────────────

  copyContent(): void {
    navigator.clipboard.writeText(this.contentText).catch(console.error);
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
    this.interrupt$.complete();
  }

  handleInvokeMagicSpider() {
    this.workspaceController.showMagicSpider({
      slideContent: this.contentText,
    });
    this.close.emit(true);
  }
}
