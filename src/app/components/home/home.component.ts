import { Component, OnInit } from '@angular/core';
import {
  PresentationMetaData,
  PresentationService,
} from '../../services/konva.services/presentation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  constructor(
    private presentationService: PresentationService,
    private router: Router,
  ) {}
  presentations: PresentationMetaData[] = [];
  ngOnInit(): void {
    this.presentations = this.presentationService.getPresentations();
}

  handleRemovePPT(ppt: PresentationMetaData, event: Event) {
    event.stopImmediatePropagation();
    this.presentationService.removePresentation(ppt.id);
    this.presentations = this.presentations.filter((p) => p.id != ppt.id);
  }

  handleNewPPT() {
    const presentation = this.presentationService.getPresentation('new');
    this.presentationService.addPresentation(presentation, '');
    this.router.navigate(['/workspace/ppt'], {
      queryParams: { id: presentation.id },
    });
  }
}
