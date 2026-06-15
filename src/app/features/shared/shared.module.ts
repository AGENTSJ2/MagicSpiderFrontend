import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoComponent } from './components/logo/logo.component';
import { AppRoutingModule } from "../../app-routing.module";
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    LogoComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    RouterModule
],
  exports:[
    LogoComponent,
    RouterModule
  ]
})
export class SharedModule { }
