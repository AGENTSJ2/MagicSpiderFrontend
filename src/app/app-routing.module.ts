import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: '',
    component:HomeComponent
  },
  {
    path: 'workspace',
    loadChildren: () =>
      import('./features/workspace/workspace-routing.module').then(
        (m) => m.WorkspaceRoutingModule,
      ),
  },
  {
    path: 'test',
    loadChildren: () =>
      import('./features/konva-test/konva-test-routing.module').then(
        (m) => m.KonvaTestRoutingModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
