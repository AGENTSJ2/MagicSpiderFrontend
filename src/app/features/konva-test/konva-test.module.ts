import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KonvaTestRoutingModule } from './konva-test-routing.module';
import { TestComponent } from './test/test.component';


@NgModule({
  declarations: [
    TestComponent
  ],
  imports: [
    CommonModule,
    KonvaTestRoutingModule
  ]
})
export class KonvaTestModule { }
