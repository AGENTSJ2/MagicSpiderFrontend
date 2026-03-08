import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspaceRoutingModule } from './workspace-routing.module';
import { SlideComponent } from './components/slide/slide.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';


@NgModule({
  declarations: [
    SlideComponent,
    WorkspaceComponent,
  ],
  imports: [
    CommonModule,
    WorkspaceRoutingModule
  ]
})
export class WorkspaceModule { }
