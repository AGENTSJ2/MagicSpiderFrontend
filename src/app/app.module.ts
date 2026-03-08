import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KonvaTestModule } from './features/konva-test/konva-test.module';
import { HomeComponent } from './components/home/home.component';
import { WorkspaceModule } from './features/workspace/workspace.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KonvaTestModule,
    WorkspaceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
