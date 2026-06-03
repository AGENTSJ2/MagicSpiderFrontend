import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
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
      slideContent: content,
      presentation: this.presentation,
    });
    this.close.emit(true);
  }
}

const content = `## ☀️ Solar Power: Harnessing the Ultimate Clean Energy

---

### Slide 1: Introduction to Solar Energy

*   **Title:** Solar Power: A Sustainable Energy Solution
*   **Definition:** Solar power is the process of converting sunlight directly into electricity or heat.
*   **The Resource:** The sun is a virtually inexhaustible source of clean energy, making it ideal for combating climate change.
*   **Key Concept:** It utilizes Photovoltaic (PV) technology to capture solar radiation.
*   **Goal:** To provide a reliable, decentralized, and environmentally friendly source of power generation.

### Slide 2: How Solar Photovoltaics Work (PV Effect)

*   **Principle:** The Photovoltaic Effect.
    *   Semiconductor materials (typically silicon) are used to absorb photons (particles of light).
    *   When light strikes the material, it excites electrons, causing them to flow and generate an electric current (DC electricity).
*   **The Conversion Process:**
    1.  **Capture:** Solar panels absorb sunlight.
    2.  **Conversion:** Semiconductor layers create a direct current (DC).
    3.  **Inversion:** The DC electricity passes through an **Inverter**, which converts it into alternating current (AC) usable by homes and the grid.
*   **Diagrammatic Flow:** Sun → Panel → Inverter → Grid/Home Use

### Slide 3: Advantages and Impact

*   **Sustainability:**
    *   **Renewable:** Sunlight is perpetually available.
    *   **Clean:** Zero greenhouse gas emissions during operation.
*   **Economic Benefits:**
    *   **Low Operating Costs:** Minimal fuel costs after installation.
    *   **Job Creation:** Driving growth in the green technology sector.
*   **Energy Independence:**
    *   Reduces reliance on centralized fossil fuel power plants.
    *   Scalable from single devices to massive utility farms.

### Slide 4: Applications and Types of Systems

*   **Utility-Scale Solar Farms (Large Scale):**
    *   Massive installations covering acres of land.
    *   Powering entire cities or regional grids.
*   **Commercial Rooftop Systems:**
    *   Installed on businesses and large institutional buildings.
    *   Ideal for reducing peak demand load.
*   **Residential Systems:**
    *   Small-to-medium scale installed on homes.
    *   Often paired with **Battery Storage** (e.g., Lithium-ion) for nighttime use.
*   **Concentrated Solar Power (CSP):**
    *   Uses mirrors and lenses to focus a large area of sunlight onto a small receiver.
    *   Generates heat to run a traditional steam turbine (suitable for continuous power).

### Slide 5: Future Outlook & Challenges

*   **Key Growth Drivers:**
    *   Rapid cost reduction of PV panels (Moore's Law effect).
    *   Increased efficiency of cell materials.
    *   Global policy support and net-zero commitments.
*   **Major Challenges:**
    *   **Energy Storage:** Developing cheaper, denser, and safer battery storage solutions.
    *   **Intermittency:** Solar power only generates electricity when the sun shines; requires robust grid management.
    *   **Land Use:** Requires significant physical space for large-scale farms.
*   **The Future:** Integration with smart grids, advanced material science, and global decentralized energy management.

---

**Summary of Slides**

*   **Slide 1:** Introduces solar power as a clean, inexhaustible energy source using PV technology.
*   **Slide 2:** Explains the technical process of PV conversion: Sunlight → Electron Excitation (DC) → Inverter → AC Electricity.
*   **Slide 3:** Highlights the benefits: zero emissions, renewable nature, and promotion of energy independence.
*   **Slide 4:** Details the diverse applications, from massive utility farms to residential rooftop systems, including CSP technology.
*   **Slide 5:** Addresses the path forward, emphasizing the need for better battery storage and smart grid solutions to overcome intermittency.`;
