import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import blobService, { AppImage } from '../../../../services/blob.service';
import { Presentation } from '../../domain/canvasModels/presenatation.model';

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

  constructor()
  {
    this.loadImages();
  }

  ngOnDestroy(): void {
    this.agentSub?.unsubscribe();
  }

  loading = false;
  private async loadImages()
  {
    this.loading = true;
    this.appImages = await blobService.getAllImages();
    this.loading = false;
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
  handleUpdateDescription(item:AppImage)
  {
    blobService.updateDescription(item.id, item.description ?? '');
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
