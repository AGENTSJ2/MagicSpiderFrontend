import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import blobService, { AppImage } from '../../../../services/blob.service';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { AgentState, LLM_Agents } from '../../../../services/agents';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss'
})
export class ImageListComponent implements OnDestroy {
  @Input() presentation !:Presentation;
  appImages:AppImage[] = [];

  imagePrompt = '';
  generating = false;
  generateError = '';
  private agentSub?: Subscription;

  constructor(private agentService: LLM_Agents)
  {
    this.loadImages();
    this.agentSub = this.agentService.imageGeneratorStream.subscribe((ev) => {
      switch (ev.action) {
        case AgentState.invoked:
        case AgentState.thinking:
          this.generating = true;
          this.generateError = '';
          break;
        case AgentState.done:
          this.generating = false;
          this.imagePrompt = '';
          this.loadImages();
          break;
        case AgentState.error:
          this.generating = false;
          this.generateError = ev.message;
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.agentSub?.unsubscribe();
  }

  generateImage() {
    const prompt = this.imagePrompt.trim();
    if (!prompt || this.generating) {
      return;
    }
    this.agentService.triggerImageGenerator({
      prompt,
      presentation: this.presentation,
    });
  }

  private async loadImages()
  {
    this.appImages = await blobService.getAllImages();
  }
  handleUploadImage(event:Event)
  {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] as any;
    const reader = new FileReader();
    reader.onload = () => {
      const appImage = blobService.addImage(reader.result as string);
      this.appImages.push(appImage);
      input.value = '';
    };
    reader.readAsDataURL(file);
  }
  handleRemoveImage(item:AppImage,event:Event)
  { 
    event.stopImmediatePropagation();
    blobService.removeImage(item.id)
    this.loadImages();
  }
  handleAddImage(appImage:AppImage)
  {
    this.presentation.getActiveSlide?.addImage({
        config: {
          attrs: {
            imageId:appImage.id
          },
          zIndex: 0,
        },
      })
  }
}
