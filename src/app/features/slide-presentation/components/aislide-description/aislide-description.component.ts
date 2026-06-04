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
  problemStatement = '';
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
    if (!this.problemStatement.trim()) return;

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
    this.workspaceController.triggerMagicSpider({
      slideContent: this.contentText,
      presentation: this.presentation,
    });
    this.close.emit(true);
  }
}

// const content = `## ☀️ Solar Power: Harnessing the Ultimate Clean Energy
// ---

// ### Slide 1: Introduction to Solar Energy

// *   **Title:** Solar Power: A Sustainable Energy Solution
// *   **Definition:** Solar power is the process of converting sunlight directly into electricity or heat.
// *   **The Resource:** The sun is a virtually inexhaustible source of clean energy, making it ideal for combating climate change.
// *   **Key Concept:** It utilizes Photovoltaic (PV) technology to capture solar radiation.
// *   **Goal:** To provide a reliable, decentralized, and environmentally friendly source of power generation.

// ### Slide 2: How Solar Photovoltaics Work (PV Effect)

// *   **Principle:** The Photovoltaic Effect.
//     *   Semiconductor materials (typically silicon) are used to absorb photons (particles of light).
//     *   When light strikes the material, it excites electrons, causing them to flow and generate an electric current (DC electricity).
// *   **The Conversion Process:**
//     1.  **Capture:** Solar panels absorb sunlight.
//     2.  **Conversion:** Semiconductor layers create a direct current (DC).
//     3.  **Inversion:** The DC electricity passes through an **Inverter**, which converts it into alternating current (AC) usable by homes and the grid.
// *   **Diagrammatic Flow:** Sun → Panel → Inverter → Grid/Home Use
// `;

const content = `
Create a set of 5 unique modern presentation slide templates.

Requirements:
- Do not add any text, titles, placeholders, icons, or content.
- Focus entirely on the visual design using shapes, lines, gradients, geometric elements, and layout composition.
- Each slide should have a distinct modern style while maintaining a professional presentation aesthetic.
- Use balanced spacing, alignment, and visual hierarchy.
- Incorporate contemporary design trends such as:
  - Abstract geometric patterns
  - Glassmorphism-inspired elements
  - Minimalist layouts
  - Gradient accents
  - Layered shapes and depth effects
  - Subtle decorative elements
- Ensure the designs are visually appealing without appearing cluttered.
- Shapes must remain within the slide boundaries.
- Utilize the available slide space effectively and create strong visual interest.
- Each template should look suitable for business, technology, startup, or corporate presentations.
- Vary the placement of decorative elements between slides to create diversity.
- The slide canvas size is Width 1333 and Height 750.

Goal:
Generate 5 polished, professional, and modern slide background templates that can later be populated with presentation content.`;
