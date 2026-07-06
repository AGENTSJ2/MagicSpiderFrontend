import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { UnsavedChangesGuard } from './guards/canDeactive.guard';
import { PresentSlideShowComponent } from './pages/present-slide-show/present-slide-show.component';

const routes: Routes = [
  {
    path:'ppt',
    component:WorkspaceComponent,
    canDeactivate:[UnsavedChangesGuard]
  },
  {
    path:'present',
    component:PresentSlideShowComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlidePresentationRoutingModule { }
