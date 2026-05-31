import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidePresentationRoutingModule } from './slide-presentation-routing.module';
import { SlideComponent } from './components/slide/slide.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { TextToolBoxComponent } from './components/text-tool-box/text-tool-box.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ShapeToolBoxComponent } from './components/shape-tool-box/shape-tool-box.component';
import { ImageToolBoxComponent } from './components/image-tool-box/image-tool-box.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AISlideDescriptionComponent } from './components/aislide-description/aislide-description.component';
import { MarkdownModule } from 'ngx-markdown'; 
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
  declarations: [
    SlideComponent,
    WorkspaceComponent,
    TextToolBoxComponent,
    ShapeToolBoxComponent,
    ImageToolBoxComponent,
    AISlideDescriptionComponent,
  ],
  imports: [
    CommonModule,
    SlidePresentationRoutingModule,
    ReactiveFormsModule,
    NzModalModule,
    MarkdownModule.forRoot(),
    NzAlertModule,
    FormsModule,
    NzInputModule,
    NzSpinModule,
    NzTagModule,
    NzButtonModule
  ]
})
export class SlidePresentationModule { }
