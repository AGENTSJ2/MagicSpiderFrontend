import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserSettings {
  name: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly storageKey = 'USER-SETTINGS';
  private readonly _user$ = new BehaviorSubject<UserSettings>(this.read());

  /** Emits the current user settings and any subsequent updates. */
  readonly user$ = this._user$.asObservable();

  get user(): UserSettings {
    return this._user$.value;
  }

  updateUser(settings: UserSettings) {
    const next: UserSettings = {
      name: settings.name?.trim() ?? '',
      email: settings.email?.trim() || undefined,
    };
    localStorage.setItem(this.storageKey, JSON.stringify(next));
    this._user$.next(next);
  }

  private read(): UserSettings {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return { name: '' };
    }
    try {
      return JSON.parse(raw) as UserSettings;
    } catch {
      return { name: '' };
    }
  }
}
