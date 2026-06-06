import { Component, OnInit } from '@angular/core';
import { PresentationMetaData, PresentationService } from '../../services/konva.services/presentation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent  implements OnInit{
  constructor(private presentationService:PresentationService)
  {

  }
  presentations:PresentationMetaData[] = []
  ngOnInit(): void {
    this.presentations = this.presentationService.getPresentations();
  }
}
