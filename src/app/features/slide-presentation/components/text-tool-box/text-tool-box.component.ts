import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  SelectTextEvent,
  UpdateTextEvent
} from '../../domain/EventModels/textEvent.model';
import { ComponentConfig } from '../../domain/EventModels/presentationEvents.model';

@Component({
  selector: 'app-text-tool-box',
  templateUrl: './text-tool-box.component.html',
  styleUrls: ['./text-tool-box.component.scss']
})
export class TextToolBoxComponent implements OnChanges {

  @Input() event!: SelectTextEvent;
  @Output() update = new EventEmitter<UpdateTextEvent>();

  form!: FormGroup;
  localConfig!: ComponentConfig<any>;

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
    if(!this.form)
    {
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
        gradientEnabled: [false],
        gradientStart: ['#000000'],
        gradientEnd: ['#ff0000'],
  
      });
    }
    else
    {
      this.form.patchValue({
        ...this.localConfig.attrs
      },{
        emitEvent:false
      })
    }
  }

  listenToChanges() {
    this.form.valueChanges.subscribe(values => {
      Object.assign(this.localConfig.attrs, values);
      this.applyChanges()
    });
  }

  applyChanges() {
    if (this.form.value.gradientEnabled) {
      this.localConfig.attrs.fillLinearGradientStartPoint = { x: 0, y: 0 };
      this.localConfig.attrs.fillLinearGradientEndPoint = { x: 200, y: 0 };

      this.localConfig.attrs.fillLinearGradientColorStops = [
        0,
        this.form.value.gradientStart,
        1,
        this.form.value.gradientEnd
      ];

      this.localConfig.attrs.fill = undefined; // important
    } else {
      this.localConfig.attrs.fill = this.form.value.fill;
    }
    const updateEvent = new UpdateTextEvent({
      ...this.event,
      previousConfig: this.event.currentConfig,
      currentConfig: this.localConfig
    });

    this.update.emit(updateEvent);
  }
}