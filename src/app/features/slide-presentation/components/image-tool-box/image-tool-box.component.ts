import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Presentation } from '../../domain/canvasModels/presenatation.model';
import {
  ComponentConfig,
  ZIndexActions,
} from '../../domain/EventModels/presentationEvents.model';
import {
  SerializableImageConfig,
} from '../../domain/canvasModels/imageComponent';
import { ICanvasComponent } from '../../domain/canvasModels/ICanvasComponent';
import { Image } from 'konva/lib/shapes/Image';

@Component({
  selector: 'app-image-tool-box',
  templateUrl: './image-tool-box.component.html',
  styleUrls: ['./image-tool-box.component.scss','../text-tool-box/text-tool-box.component.scss'],
})
export class ImageToolBoxComponent implements OnChanges {
  @Input() presentation!: Presentation;
  @Input() component!: ICanvasComponent;

  form!: FormGroup;
  localConfig!: ComponentConfig<SerializableImageConfig>;
  private sub?: Subscription;
  private updateTimeOut: any;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
  }

  initForm() {
    const attrs = (this.component?.node as Image)?.toObject().attrs;
    if(!attrs)
    {
      return
    }
    this.localConfig = { attrs, zIndex: this.component.node.zIndex() };
    if (!this.form) {
      this.form = this.fb.group({
        x: [attrs.x ?? 10],
        y: [attrs.y ?? 10],
        width: [attrs.width ?? 300],
        height: [attrs.height ?? 180],
        rotation: [attrs.rotation ?? 0],
        opacity: [attrs.opacity ?? 1],
        stroke: [attrs.stroke || '#000000'],
        strokeWidth: [attrs.strokeWidth || 0],
        cornerRadius: [attrs.cornerRadius || 0],
      });
    } else {
      this.form.patchValue(
        {
          x: attrs.x ?? 10,
          y: attrs.y ?? 10,
          width: attrs.width ?? 300,
          height: attrs.height ?? 180,
          rotation: attrs.rotation ?? 0,
          opacity: attrs.opacity ?? 1,
          stroke: attrs.stroke || '#000000',
          strokeWidth: attrs.strokeWidth || 0,
          cornerRadius: attrs.cornerRadius || 0,
        },
        {
          emitEvent: false,
        },
      );
    }
    this.listenToChanges();

  }

  listenToChanges() {
    this.sub?.unsubscribe();
    this.sub = this.form.valueChanges.subscribe((values) => {
      Object.assign(this.localConfig.attrs, values);
      clearTimeout(this.updateTimeOut);
      this.updateTimeOut = setTimeout(() => {
        this.applyChanges();
      }, 200);
    });
  }

  ZIndexActions = ZIndexActions;

  move(action: ZIndexActions) {
    // const updateEvent = new UpdateImageEvent({
    //   ...this.event,
    //   previousConfig: this.event.currentConfig,
    //   currentConfig: this.localConfig,
    //   trackHistory: true,
    //   zIndexActions: action
    // });
    // this.presentation.publishEvent(updateEvent);
  }

  replaceImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.localConfig.attrs.imageSrc = reader.result as string;
      this.applyChanges();
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  applyChanges() {
    this.component.updateComponent({ newConfig: this.localConfig });
  }
}
