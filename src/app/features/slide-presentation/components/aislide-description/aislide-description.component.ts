import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AgentStreamEvent, LLM_Agents } from '../../../../services/agents';

enum StreamPhase {
  idle = "Idle",
  thinking = "Thinking",
  content = "Content",
  done = "Done",
  error = "Error",
}

@Component({
  selector: 'app-aislide-description',
  templateUrl: './aislide-description.component.html',
  styleUrl: './aislide-description.component.scss',
})
export class AISlideDescriptionComponent {
  @Input() isVisible = false;
  problemStatement = '';
  thinkingText = '';
  contentText = '';
  phase: StreamPhase = StreamPhase.idle;
  StreamPhase = StreamPhase;
  errorMessage = '';

  private streamSub?: Subscription;
  private interrupt$ = new Subject<boolean>();

  constructor(
    private cdr: ChangeDetectorRef,
    private agentService: LLM_Agents,
  ) {}

  // ── Helpers ───────────────────────────────────────────────────────────────



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
    this.isVisible = true;
  }

  handleCancel(): void {
    if (this.phase === StreamPhase.thinking || this.phase === StreamPhase.content) return;
    this.isVisible = false;
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
    if (!this.problemStatement.trim()) return;

    this.thinkingText = '';
    this.contentText = '';
    this.phase = StreamPhase.thinking;
    this.errorMessage = '';

    try {
      const stream$ = await this.agentService.ContentCreator({
        userProblemStatement: this.problemStatement.trim(),
      });

      this.streamSub = stream$.responseEvent.subscribe({
        next: (event: AgentStreamEvent) => {
          if (event.action === 'thinking') {
            this.thinkingText += event.message;
            if (this.phase !== StreamPhase.thinking){
              this.phase = StreamPhase.thinking;
            } 
          } else if (event.action === 'content') {
            this.phase = StreamPhase.content;
            this.contentText += event.message;
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
}
