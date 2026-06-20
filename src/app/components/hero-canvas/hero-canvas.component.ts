import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import type * as THREE from 'three';

/**
 * Decorative WebGL "constellation web" for the home hero — drifting points
 * connected by faint threads when near, with a slow auto-rotation and a subtle
 * mouse parallax. Three.js is loaded lazily so it stays out of the eager main
 * bundle. Purely decorative: transparent canvas, no pointer interaction, and it
 * stays still for users who prefer reduced motion.
 */
@Component({
  selector: 'app-hero-canvas',
  templateUrl: './hero-canvas.component.html',
  styleUrl: './hero-canvas.component.scss',
})
export class HeroCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  // ── tunables ──────────────────────────────────────────────────────────────
  private readonly COUNT = 90; // number of nodes
  private readonly LINK_DIST = 17; // world distance to draw a thread
  private readonly bounds = { x: 56, y: 34, z: 26 };

  // ── three.js handles ────────────────────────────────────────────────────────
  private THREE!: typeof THREE;
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private group?: THREE.Group;
  private points?: THREE.Points;
  private lines?: THREE.LineSegments;

  // ── animation state ─────────────────────────────────────────────────────────
  private positions!: Float32Array;
  private velocities!: Float32Array;
  private linePositions!: Float32Array;
  private spin = 0;
  private readonly pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private frameId = 0;
  private resizeObserver?: ResizeObserver;
  private reducedMotion = false;
  private destroyed = false;

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    try {
      this.THREE = await import('three');
      if (this.destroyed) {
        return;
      }
      this.init();
    } catch {
      // WebGL or three unavailable — leave the hero background empty.
      this.host.nativeElement.style.display = 'none';
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.host.nativeElement);

      if (this.reducedMotion) {
        this.rebuildLines();
        this.renderFrame();
      } else {
        window.addEventListener('pointermove', this.onPointerMove, {
          passive: true,
        });
        this.animate();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.resizeObserver?.disconnect();

    this.points?.geometry.dispose();
    const pMat = this.points?.material as THREE.PointsMaterial | undefined;
    pMat?.map?.dispose();
    pMat?.dispose();

    this.lines?.geometry.dispose();
    (this.lines?.material as THREE.LineBasicMaterial | undefined)?.dispose();

    this.renderer?.dispose();
  }

  // ── setup ────────────────────────────────────────────────────────────────────
  private init(): void {
    const T = this.THREE;
    const canvas = this.canvasRef.nativeElement;

    const renderer = new T.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer = renderer;

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, 1, 0.1, 1000);
    this.camera.position.set(0, 0, 72);

    this.group = new T.Group();
    this.scene.add(this.group);

    this.buildNodes();
    this.buildThreads();

    this.onResize();
  }

  private buildNodes(): void {
    const T = this.THREE;
    this.positions = new Float32Array(this.COUNT * 3);
    this.velocities = new Float32Array(this.COUNT * 3);
    const colors = new Float32Array(this.COUNT * 3);

    const blue = new T.Color('#4A90E2');
    const purple = new T.Color('#7c3aed');
    const tmp = new T.Color();

    for (let i = 0; i < this.COUNT; i++) {
      const i3 = i * 3;
      this.positions[i3] = (Math.random() * 2 - 1) * this.bounds.x;
      this.positions[i3 + 1] = (Math.random() * 2 - 1) * this.bounds.y;
      this.positions[i3 + 2] = (Math.random() * 2 - 1) * this.bounds.z;
      this.velocities[i3] = (Math.random() * 2 - 1) * 0.045;
      this.velocities[i3 + 1] = (Math.random() * 2 - 1) * 0.045;
      this.velocities[i3 + 2] = (Math.random() * 2 - 1) * 0.045;

      tmp.copy(blue).lerp(purple, Math.random());
      colors[i3] = tmp.r;
      colors[i3 + 1] = tmp.g;
      colors[i3 + 2] = tmp.b;
    }

    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new T.BufferAttribute(colors, 3));

    const material = new T.PointsMaterial({
      size: 2.7,
      map: this.createNodeTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.points = new T.Points(geo, material);
    this.points.frustumCulled = false;
    this.group!.add(this.points);
  }

  private buildThreads(): void {
    const T = this.THREE;
    // Upper bound on segment endpoints: every possible pair, two vertices each.
    this.linePositions = new Float32Array(this.COUNT * this.COUNT * 3);

    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.BufferAttribute(this.linePositions, 3));

    const material = new T.LineBasicMaterial({
      color: new T.Color('#6d5ef0'),
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });

    this.lines = new T.LineSegments(geo, material);
    this.lines.frustumCulled = false;
    this.group!.add(this.lines);
  }

  /** Soft round sprite so nodes render as glowing dots rather than squares. */
  private createNodeTexture(): THREE.CanvasTexture {
    const size = 64;
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = size;
    const ctx = cnv.getContext('2d')!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new this.THREE.CanvasTexture(cnv);
  }

  // ── loop ─────────────────────────────────────────────────────────────────────
  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    this.moveNodes();
    this.rebuildLines();

    this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.04;
    this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.04;
    this.spin += 0.0009;
    this.group!.rotation.y = this.spin + this.pointer.x * 0.35;
    this.group!.rotation.x = this.pointer.y * 0.22;

    this.renderFrame();
  };

  private moveNodes(): void {
    const pos = this.positions;
    const vel = this.velocities;
    const b = this.bounds;
    for (let i = 0; i < this.COUNT; i++) {
      const i3 = i * 3;
      pos[i3] += vel[i3];
      pos[i3 + 1] += vel[i3 + 1];
      pos[i3 + 2] += vel[i3 + 2];
      // wrap around the box so the field never empties out
      if (pos[i3] > b.x) pos[i3] = -b.x;
      else if (pos[i3] < -b.x) pos[i3] = b.x;
      if (pos[i3 + 1] > b.y) pos[i3 + 1] = -b.y;
      else if (pos[i3 + 1] < -b.y) pos[i3 + 1] = b.y;
      if (pos[i3 + 2] > b.z) pos[i3 + 2] = -b.z;
      else if (pos[i3 + 2] < -b.z) pos[i3 + 2] = b.z;
    }
    (this.points!.geometry.attributes['position'] as THREE.BufferAttribute).needsUpdate =
      true;
  }

  private rebuildLines(): void {
    const pos = this.positions;
    const lp = this.linePositions;
    const maxDist2 = this.LINK_DIST * this.LINK_DIST;
    let n = 0;

    for (let i = 0; i < this.COUNT; i++) {
      const i3 = i * 3;
      const xi = pos[i3];
      const yi = pos[i3 + 1];
      const zi = pos[i3 + 2];
      for (let j = i + 1; j < this.COUNT; j++) {
        const j3 = j * 3;
        const dx = xi - pos[j3];
        const dy = yi - pos[j3 + 1];
        const dz = zi - pos[j3 + 2];
        if (dx * dx + dy * dy + dz * dz < maxDist2) {
          lp[n++] = xi;
          lp[n++] = yi;
          lp[n++] = zi;
          lp[n++] = pos[j3];
          lp[n++] = pos[j3 + 1];
          lp[n++] = pos[j3 + 2];
        }
      }
    }

    const geo = this.lines!.geometry as THREE.BufferGeometry;
    geo.setDrawRange(0, n / 3);
    (geo.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
  }

  private renderFrame(): void {
    this.renderer!.render(this.scene!, this.camera!);
  }

  // ── events ────────────────────────────────────────────────────────────────────
  private onResize = (): void => {
    if (!this.renderer || !this.camera) {
      return;
    }
    const el = this.host.nativeElement;
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.reducedMotion) {
      this.renderFrame();
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    this.pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };
}
