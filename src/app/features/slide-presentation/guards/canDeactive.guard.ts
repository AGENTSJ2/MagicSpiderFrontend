import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<any> {
  canDeactivate(
    component: any,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return component.canDeactivate();
  }
}
