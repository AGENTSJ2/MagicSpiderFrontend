import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SlidePresentationModule } from './features/slide-presentation/slide-presentation.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SlidePresentationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
