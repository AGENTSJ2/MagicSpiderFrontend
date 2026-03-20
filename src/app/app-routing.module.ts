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
      import('./features/slide-presentation/slide-presentation-routing.module').then(
        (m) => m.SlidePresentationRoutingModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
