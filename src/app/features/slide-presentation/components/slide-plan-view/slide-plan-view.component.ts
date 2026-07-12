import { Component, Input } from '@angular/core';
import { ArchitectComponentTask, ArchitectSlidePlan, PlanProgress, PresentationArchitecture } from '../../../../agents/core/model';


@Component({
  selector: 'app-slide-plan-view',
  templateUrl: './slide-plan-view.component.html',
  styleUrl: './slide-plan-view.component.scss',
})
export class SlidePlanViewComponent {
  @Input() slidePlan!: PresentationArchitecture;

  // Expose the enum to the template.
  readonly PlanProgress = PlanProgress;

  /** Keys of slides whose task list is expanded. Collapsed by default. */
  private expanded = new Set<string>();

  get slides(): ArchitectSlidePlan[] {
    return this.slidePlan?.presentation?.slides ?? [];
  }

  isExpanded(index: number, slide: ArchitectSlidePlan): boolean {
    return this.expanded.has(this.trackBySlide(index, slide));
  }

  toggle(index: number, slide: ArchitectSlidePlan): void {
    const key = this.trackBySlide(index, slide);
    if (this.expanded.has(key)) {
      this.expanded.delete(key);
    } else {
      this.expanded.add(key);
    }
  }

  get completedCount(): number {
    return this.slides.filter((s) => s.planProgress === PlanProgress.complete)
      .length;
  }

  get totalCount(): number {
    return this.slides.length;
  }

  progressOf(slide: ArchitectSlidePlan): PlanProgress {
    return slide.planProgress ?? PlanProgress.idle;
  }

  isPending(slide: ArchitectSlidePlan): boolean {
    return this.progressOf(slide) === PlanProgress.idle;
  }

  isInProgress(slide: ArchitectSlidePlan): boolean {
    return this.progressOf(slide) === PlanProgress.inProgress;
  }

  isComplete(slide: ArchitectSlidePlan): boolean {
    return this.progressOf(slide) === PlanProgress.complete;
  }

  statusLabel(slide: ArchitectSlidePlan): string {
    switch (this.progressOf(slide)) {
      case PlanProgress.inProgress:
        return 'Building';
      case PlanProgress.complete:
        return 'Done';
      default:
        return 'Queued';
    }
  }

  /** New slides have no slideId yet, existing ones reuse their id. */
  isNewSlide(slide: ArchitectSlidePlan): boolean {
    return !slide.slideId;
  }

  isNewComponent(component: ArchitectComponentTask): boolean {
    return !component.id;
  }

  trackBySlide = (index: number, slide: ArchitectSlidePlan): string =>
    slide.slideId ?? `new-${index}`;

  trackByComponent = (
    index: number,
    component: ArchitectComponentTask,
  ): string => component.id ?? `new-${index}`;
}
