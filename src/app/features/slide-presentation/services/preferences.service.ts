import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SlidePreferences {
  /**
   * When true, slides are generated all at the same time (in parallel).
   * When false, slides are generated one at a time (sequentially).
   */
  parallelSlideGeneration: boolean;
}

const DEFAULT_PREFERENCES: SlidePreferences = {
  parallelSlideGeneration: false,
};

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly storageKey = 'SLIDE-PREFERENCES';
  private readonly _preferences$ = new BehaviorSubject<SlidePreferences>(
    this.read(),
  );

  /** Emits the current preferences and any subsequent updates. */
  readonly preferences$ = this._preferences$.asObservable();

  get preferences(): SlidePreferences {
    return this._preferences$.value;
  }

  get parallelSlideGeneration(): boolean {
    return this._preferences$.value.parallelSlideGeneration;
  }

  updatePreferences(preferences: Partial<SlidePreferences>) {
    const next: SlidePreferences = {
      ...this._preferences$.value,
      ...preferences,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(next));
    this._preferences$.next(next);
  }

  private read(): SlidePreferences {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }
    try {
      return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<SlidePreferences>) };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }
}
