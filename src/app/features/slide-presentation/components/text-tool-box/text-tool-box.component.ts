import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  SelectTextEvent,
  UpdateTextEvent
} from '../../domain/EventModels/textEvent.model';
import { ComponentConfig, ZIndexActions } from '../../domain/EventModels/presentationEvents.model';
import { Subscription } from 'rxjs';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { TextConfig } from 'konva/lib/shapes/Text';

@Component({
  selector: 'app-text-tool-box',
  templateUrl: './text-tool-box.component.html',
  styleUrls: ['./text-tool-box.component.scss']
})
export class TextToolBoxComponent implements OnChanges {

  @Input() event!: SelectTextEvent;
  @Input() presentation!: Presentation;

  form!: FormGroup;
  localConfig!: ComponentConfig<TextConfig>;
  private sub?: Subscription;
  private updateTimeOut: any;
  constructor(private fb: FormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event?.currentConfig) {
      this.localConfig = structuredClone(this.event.currentConfig);
      this.initForm();
      this.listenToChanges();
    }
  }

  initForm() {
    const attrs = this.localConfig.attrs;
    const isGradientEnabled = attrs.fill == undefined;   
    this.sub?.unsubscribe();
    if (!this.form) {
      this.form = this.fb.group({
        text: [attrs.text],
        fontFamily: [attrs.fontFamily],
        fontStyle: [attrs.fontStyle],
        fontSize: [attrs.fontSize],
        lineHeight: [attrs.lineHeight],
        fill: [attrs.fill],
        align: [attrs.align],
        stroke: [attrs.stroke || '#000000'],
        strokeWidth: [attrs.strokeWidth || 0],
        gradientEnabled: [isGradientEnabled],
        gradientStart: [attrs.fillLinearGradientColorStops?.at(1) ?? '#000000'],
        gradientEnd: [attrs.fillLinearGradientColorStops?.at(3) ?? '#ff0000'],
        gradientOffset: [attrs.fillLinearGradientColorStops?.at(2) ?? 1],
        gradientWidth: attrs.fillLinearGradientEndPointX,
      });
    }
    else {
      this.form.patchValue({
        ...this.localConfig.attrs
      }, {
        emitEvent: false
      })
    }
  }

  listenToChanges() {
    this.sub = this.form.valueChanges.subscribe(values => {
      Object.assign(this.localConfig.attrs, values);
      clearTimeout(this.updateTimeOut);
      this.updateTimeOut = setTimeout(() => {
        this.applyChanges()
      }, 200)
    });
  }
  ZIndexActions = ZIndexActions;
  move(action:ZIndexActions)
  {
    const updateEvent = new UpdateTextEvent({
      ...this.event,
      previousConfig: this.event.currentConfig,
      currentConfig: this.localConfig,
      trackHistory: true,
      zIndexActions:action
    });
    this.presentation.publishEvent(updateEvent);
  }

  applyChanges() {
    if (this.form.value.gradientEnabled) {
      this.localConfig.attrs.fillLinearGradientStartPoint = { x: 0, y: 0 };
      this.localConfig.attrs.fillLinearGradientEndPoint = { x: this.form.value.gradientWidth || 200, y: 0 };
      this.localConfig.attrs.fillLinearGradientColorStops = [
        0,
        this.form.value.gradientStart,
        this.form.value.gradientOffset,
        this.form.value.gradientEnd
      ];

      this.localConfig.attrs.fill = undefined; // important
    } else {
      this.localConfig.attrs.fill = this.form.value.fill;
    }
    const updateEvent = new UpdateTextEvent({
      ...this.event,
      previousConfig: this.event.currentConfig,
      currentConfig: this.localConfig,
      trackHistory: true
    });
    this.presentation.publishEvent(updateEvent);
  }
}