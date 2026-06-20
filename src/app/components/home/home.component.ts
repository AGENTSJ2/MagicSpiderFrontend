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
  async ngOnInit(): Promise<void> {
    this.presentations = await this.presentationService.getPresentations();
  }

  async handleRemovePPT(ppt: PresentationMetaData, event: Event) {
    event.stopImmediatePropagation();
    await this.presentationService.removePresentation(ppt.id, true);
    this.presentations = this.presentations.filter((p) => p.id != ppt.id);
  }

  async handleNewPPT() {
    const presentation = await this.presentationService.getPresentation('new');
    await this.presentationService.addPresentation(presentation, '');
    this.router.navigate(['/workspace/ppt'], {
      queryParams: { id: presentation.id },
    });
  }
}
