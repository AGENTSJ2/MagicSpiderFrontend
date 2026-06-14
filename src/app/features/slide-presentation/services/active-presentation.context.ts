import { Injectable } from '@angular/core';
import { Presentation } from '../domain/canvasModels/presenatation.model';

/**
 * Holds the presentation currently open in the workspace.
 * Must stay dependency-free: it is shared by the UI layer
 * (WorkspaceController) and the MCP layer (McpActions), which
 * would otherwise form a DI cycle.
 */
@Injectable({
  providedIn: 'root',
})
export class ActivePresentationContext {
  private _activePresentation?: Presentation;

  get activePresentation(): Presentation | undefined {
    return this._activePresentation;
  }

  set activePresentation(v: Presentation | undefined) {
    this._activePresentation = v;
  }
}
