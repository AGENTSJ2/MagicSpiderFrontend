import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidePresentationRoutingModule } from './slide-presentation-routing.module';
import { SlideComponent } from './components/slide/slide.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';


@NgModule({
  declarations: [
    SlideComponent,
    WorkspaceComponent,
  ],
  imports: [
    CommonModule,
    SlidePresentationRoutingModule
  ]
})
export class SlidePresentationModule { }
