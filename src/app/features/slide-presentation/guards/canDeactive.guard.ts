import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivate<any> {
  canDeactivate(component: any): boolean {
    return component.canDeactivate();
  }
}
