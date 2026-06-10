import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { UnsavedChangesGuard } from './guards/canDeactive.guard';

const routes: Routes = [
  {
    path:'ppt',
    component:WorkspaceComponent,
    canDeactivate:[UnsavedChangesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlidePresentationRoutingModule { }
