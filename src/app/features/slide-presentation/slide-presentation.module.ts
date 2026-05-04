import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidePresentationRoutingModule } from './slide-presentation-routing.module';
import { SlideComponent } from './components/slide/slide.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { TextToolBoxComponent } from './components/text-tool-box/text-tool-box.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShapeToolBoxComponent } from './components/shape-tool-box/shape-tool-box.component';


@NgModule({
  declarations: [
    SlideComponent,
    WorkspaceComponent,
    TextToolBoxComponent,
    ShapeToolBoxComponent,
  ],
  imports: [
    CommonModule,
    SlidePresentationRoutingModule,
    ReactiveFormsModule
  ]
})
export class SlidePresentationModule { }
