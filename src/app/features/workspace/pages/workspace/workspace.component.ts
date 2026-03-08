import { Component, OnInit } from '@angular/core';
import { Presentation } from '../../models/presenatation.model';
import { PresentationEventType, SlideService } from '../../services/slide.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements OnInit{
  presentation!:Presentation;
  constructor(private slideService:SlideService){}
  ngOnInit(): void {
    this.presentation = {
      id:"p1",
      config:{
        ratio:{num:16,den:9},
        pixelRatio:1
      },
      slides:[{
        slideId:'1',
        components:[]
      }]
    }
  }
  handleAddText()
  {
    this.slideService.addText({
      presentationId:this.presentation.id,
      slideId:this.presentation.slides[0].slideId,
      type:PresentationEventType.ADD_TEXT
    })
  }
}
