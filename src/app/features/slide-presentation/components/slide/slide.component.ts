import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { DocumentConfiguration } from '../../domain/models/documentConfiguration.model';
import { Slide } from '../../domain/canvasModels/slide.model';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';

const ZOOM_STORAGE_KEY = 'slide-preferred-zoom';
const PAN_STORAGE_KEY = 'slide-preferred-pan';
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.0015; // wheel delta sensitivity

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrl: './slide.component.scss',
})
export class SlideComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slide', { static: false })
  cont!: ElementRef<HTMLDivElement>;
  @Input() slide!: Slide;

  zoom = 1;
  panX = 0;
  panY = 0;

  private observer!: ResizeObserver;

  // pinch state
  private pinchStartDistance = 0;
  private pinchStartZoom = 1;

  // pan state
  isPanning = false;

  // gesture gate — only zoom/pan while the pointer is over this slide
  private isHovering = false;
  private panStartX = 0;
  private panStartY = 0;
  private panOriginX = 0;
  private panOriginY = 0;

  constructor(private workspaceController:WorkspaceController) {
    this.zoom = this.loadZoom();
    const pan = this.loadPan();
    this.panX = pan.x;
    this.panY = pan.y;
  }

  ngAfterViewInit(): void {
    // 16 : 9 (normal slide ratio)
    const config: DocumentConfiguration = {
      ratio: { num: 16, den: 9 },
      pixelRatio: 1,
    };
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.slide.controller.triggerResize({ divElm: this.cont.nativeElement, config: config });
      }
    });
    this.observer.observe(this.cont.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }

  get transform(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isHovering = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isHovering = false;
  }

  /** Ctrl + mouse wheel to zoom (desktop / trackpad pinch). */
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.isHovering || !event.ctrlKey) {
      return;
    }
    event.preventDefault();
    this.applyZoom(this.zoom - event.deltaY * ZOOM_STEP * this.zoom);
  }

  // ---- Mouse pan ----

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // only pan with the primary button while zoomed in
    if (event.button !== 0 || this.zoom <= 1) {
      return;
    }
    this.beginPan(event.clientX, event.clientY);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isPanning) {
      return;
    }
    event.preventDefault();
    this.updatePan(event.clientX, event.clientY);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.endPan();
  }

  // ---- Touch pinch + pan ----

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 2) {
      this.pinchStartDistance = this.touchDistance(event);
      this.pinchStartZoom = this.zoom;
      this.endPan();
    } else if (event.touches.length === 1 && this.zoom > 1) {
      this.beginPan(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2 && this.pinchStartDistance > 0) {
      event.preventDefault();
      const scale = this.touchDistance(event) / this.pinchStartDistance;
      this.applyZoom(this.pinchStartZoom * scale);
    } else if (event.touches.length === 1 && this.isPanning) {
      event.preventDefault();
      this.updatePan(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.pinchStartDistance = 0;
    }
    if (event.touches.length === 0) {
      this.endPan();
    }
  }

  private beginPan(clientX: number, clientY: number): void {
    this.isPanning = true;
    this.panStartX = clientX;
    this.panStartY = clientY;
    this.panOriginX = this.panX;
    this.panOriginY = this.panY;
  }

  private updatePan(clientX: number, clientY: number): void {    
    if(!this.workspaceController.selectedComponent) {
      this.panX = this.panOriginX + (clientX - this.panStartX);
      this.panY = this.panOriginY + (clientY - this.panStartY);
    }
  }

  private endPan(): void {
    if (this.isPanning) {
      this.isPanning = false;
      this.savePan(this.panX, this.panY);
    }
  }

  private applyZoom(value: number): void {
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 1000) / 1000));
    // reset pan when back at (or below) natural size so the slide re-centers
    if (this.zoom <= 1) {
      this.panX = 0;
      this.panY = 0;
      this.savePan(0, 0);
    }
    this.saveZoom(this.zoom);
  }

  private touchDistance(event: TouchEvent): number {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  private loadZoom(): number {
    try {
      const stored = parseFloat(localStorage.getItem(ZOOM_STORAGE_KEY) ?? '');
      if (!isNaN(stored)) {
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, stored));
      }
    } catch {
      // localStorage unavailable (e.g. privacy mode) — fall back to default
    }
    return 1;
  }

  private saveZoom(value: number): void {
    try {
      localStorage.setItem(ZOOM_STORAGE_KEY, String(value));
    } catch {
      // ignore persistence failures
    }
  }

  private loadPan(): { x: number; y: number } {
    try {
      const raw = localStorage.getItem(PAN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          return { x: parsed.x, y: parsed.y };
        }
      }
    } catch {
      // ignore malformed / unavailable storage
    }
    return { x: 0, y: 0 };
  }

  private savePan(x: number, y: number): void {
    try {
      localStorage.setItem(PAN_STORAGE_KEY, JSON.stringify({ x, y }));
    } catch {
      // ignore persistence failures
    }
  }
}
