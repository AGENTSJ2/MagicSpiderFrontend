import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceController } from '../workspace/workspace.controller';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { PresentationService } from '../../services/presentation.service';

@Component({
  selector: 'app-present-slide-show',
  templateUrl: './present-slide-show.component.html',
  styleUrl: './present-slide-show.component.scss',
})
export class PresentSlideShowComponent implements OnInit {
  currentIndex = 0;
  loading = false;

  constructor(
    public workSpaceController: WorkspaceController,
    private presentationService: PresentationService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  get presentation(): Presentation | undefined {
    return this.workSpaceController.activePresentation;
  }

  get slides(): Slide[] {
    return this.presentation?.slides ?? [];
  }

  async ngOnInit(): Promise<void> {
    // When opened directly (e.g. refresh / deep link) the active presentation
    // may not be in memory yet — fall back to loading it from the id query param.
    if (!this.presentation) {
      const id = this.route.snapshot.queryParamMap.get('id');
      if (id) {
        try {
          this.loading = true;
          this.workSpaceController.setActivePresentation =
            await this.presentationService.getPresentation(id);
        } catch (error) {
          console.error(error);
        } finally {
          this.loading = false;
        }
      }
    }

    // Start from whichever slide was active in the editor, else the first one.
    const active = this.presentation?.getActiveSlide;
    const activeIdx = active
      ? this.slides.findIndex((s) => s.slideId === active.slideId)
      : -1;
    this.goToSlide(activeIdx >= 0 ? activeIdx : 0);
  }

  private goToSlide(index: number): void {
    const slide = this.slides[index];
    if (!slide || !this.presentation) {
      return;
    }
    this.currentIndex = index;
    // Toggle through undefined so <app-slide> is destroyed and recreated,
    // which re-hosts the target slide's Konva stage in the view.
    this.presentation.setActiveSlide = undefined;
    setTimeout(() => {
      if (this.presentation) {
        this.presentation.setActiveSlide = slide;
        // Presentation mode: never show editor transformer/selection handles.
        slide.controller.clearSelections();
      }
    });
  }

  next(event?: Event): void {
    event?.stopPropagation();
    if (this.currentIndex < this.slides.length - 1) {
      this.goToSlide(this.currentIndex + 1);
    }
  }

  prev(event?: Event): void {
    event?.stopPropagation();
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    }
  }

  onBackdropClick($event:Event): void {
    // Click anywhere on the stage to advance, like a normal slideshow.
    this.next();
    $event.stopImmediatePropagation();
  }

  exit(event?: Event): void {
    event?.stopPropagation();
    this.location.back();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        event.preventDefault();
        this.next();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        this.prev();
        break;
      case 'Escape':
        this.exit();
        break;
    }
  }
}
