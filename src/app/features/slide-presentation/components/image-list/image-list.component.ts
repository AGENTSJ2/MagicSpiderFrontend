import { Component, Input } from '@angular/core';
import blobService, { AppImage } from '../../../../services/blob.service';
import { Presentation } from '../../domain/canvasModels/presenatation.model';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.scss'
})
export class ImageListComponent {
  @Input() presentation !:Presentation;
  appImages:AppImage[] = [];
  constructor()
  {
    this.loadImages();
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
