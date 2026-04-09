import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidePresentationRoutingModule } from './slide-presentation-routing.module';
import { SlideComponent } from './components/slide/slide.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { TextToolBoxComponent } from './components/text-tool-box/text-tool-box.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    SlideComponent,
    WorkspaceComponent,
    TextToolBoxComponent,
  ],
  imports: [
    CommonModule,
    SlidePresentationRoutingModule,
    ReactiveFormsModule
  ]
})
export class SlidePresentationModule { }
