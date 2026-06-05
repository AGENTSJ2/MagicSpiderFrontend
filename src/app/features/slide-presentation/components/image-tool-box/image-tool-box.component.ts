import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ComponentConfig, ZIndexActions } from '../../domain/EventModels/presentationEvents.model';
import { SerializableImageConfig } from '../../domain/canvasModels/imageComponent';

@Component({
  selector: 'app-image-tool-box',
  templateUrl: './image-tool-box.component.html',
  styleUrls: ['./image-tool-box.component.scss']
})
export class ImageToolBoxComponent implements OnChanges {

  @Input() presentation!: Presentation;

  form!: FormGroup;
  localConfig!: ComponentConfig<SerializableImageConfig>;
  private sub?: Subscription;
  private updateTimeOut: any;

  constructor(private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
  }

  initForm() {
    const attrs = this.localConfig.attrs;
    this.sub?.unsubscribe();

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
    }
    else {
      this.form.patchValue({
        x: attrs.x ?? 10,
        y: attrs.y ?? 10,
        width: attrs.width ?? 300,
        height: attrs.height ?? 180,
        rotation: attrs.rotation ?? 0,
        opacity: attrs.opacity ?? 1,
        stroke: attrs.stroke || '#000000',
        strokeWidth: attrs.strokeWidth || 0,
        cornerRadius: attrs.cornerRadius || 0,
      }, {
        emitEvent: false
      });
    }
  }

  listenToChanges() {
    this.sub = this.form.valueChanges.subscribe(values => {
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
    // const updateEvent = new UpdateImageEvent({
    //   ...this.event,
    //   previousConfig: this.event.currentConfig,
    //   currentConfig: this.localConfig,
    //   trackHistory: true
    // });
    // this.presentation.publishEvent(updateEvent);
    throw Error('Not implemented')

  }
}
