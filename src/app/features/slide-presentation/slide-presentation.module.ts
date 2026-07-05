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
import { MagicSpiderAssistantComponent } from './components/magic-spider-assistant/magic-spider-assistant.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { ContentEditableSpanDirective } from '../.././directives/content-editable-span.directive';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { QuillModule } from 'ngx-quill'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../shared/shared.module';
import { SettingsComponent } from './pages/settings/settings.component';
import { ImageListComponent } from './components/image-list/image-list.component';
import { SlidePlanViewComponent } from './components/slide-plan-view/slide-plan-view.component';

@NgModule({
  declarations: [
    SlideComponent,
    WorkspaceComponent,
    TextToolBoxComponent,
    ShapeToolBoxComponent,
    ImageToolBoxComponent,
    AISlideDescriptionComponent,
    MagicSpiderAssistantComponent,
    ContentEditableSpanDirective,
    SettingsComponent,
    ImageListComponent,
    SlidePlanViewComponent
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
    NzButtonModule,
    NzDrawerModule,
    NzDropDownModule,
    NzMessageModule,
    NzSelectModule,
    QuillModule.forRoot(),
    DragDropModule,
    SharedModule
  ]
})
export class SlidePresentationModule { }
