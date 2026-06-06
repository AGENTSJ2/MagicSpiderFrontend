import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShapeConfig } from 'konva/lib/Shape';
import { Subscription } from 'rxjs';

import {
  ComponentConfig,
  ZIndexActions,
} from '../../domain/EventModels/presentationEvents.model';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { ICanvasComponent } from '../../domain/canvasModels/ICanvasComponent';

@Component({
  selector: 'app-shape-tool-box',
  templateUrl: './shape-tool-box.component.html',
  styleUrls: ['./shape-tool-box.component.scss'],
})
export class ShapeToolBoxComponent implements OnChanges {
  @Input() presentation!: Presentation;
  @Input() component!: ICanvasComponent;

  form!: FormGroup;
  localConfig!: ComponentConfig<ShapeConfig>;
  private sub?: Subscription;
  private updateTimeOut: any;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
    this.listenToChanges();
  }

  initForm() {
    const attrs = this.component.node.toObject().attrs;
    const isGradientEnabled = attrs.fill == undefined;

    if (!this.form) {
      this.form = this.fb.group({
        x: [attrs.x?.toFixed(1)],
        y: [attrs.y?.toFixed(1)],
        width: [attrs.width?.toFixed(1)],
        height: [attrs.height?.toFixed(1)],
        rotation: [attrs.rotation?.toFixed(1)],
        opacity: [attrs.opacity?.toFixed(1)],
        fill: [attrs.fill ?? '#ffffff'],
        stroke: [attrs.stroke || '#000000'],
        strokeWidth: [attrs.strokeWidth || 0],
        cornerRadius: [attrs['cornerRadius'] || 0],
        gradientEnabled: [isGradientEnabled],
        gradientStart: [attrs.fillLinearGradientColorStops?.at(1) ?? '#ffffff'],
        gradientEnd: [attrs.fillLinearGradientColorStops?.at(3) ?? '#ff0000'],
        gradientOffset: [attrs.fillLinearGradientColorStops?.at(2) ?? 1],
        gradientWidth: [
          attrs.fillLinearGradientEndPointX ?? attrs.width ?? 100,
        ],
      });
    } else {
      this.form.patchValue(
        {
          x: attrs.x ?? 10,
          y: attrs.y ?? 10,
          width: attrs.width ?? 100,
          height: attrs.height ?? 100,
          rotation: attrs.rotation ?? 0,
          opacity: attrs.opacity ?? 1,
          fill: attrs.fill ?? '#ffffff',
          stroke: attrs.stroke || '#000000',
          strokeWidth: attrs.strokeWidth || 0,
          cornerRadius: attrs['cornerRadius'] || 0,
          gradientEnabled: isGradientEnabled,
          gradientStart: attrs.fillLinearGradientColorStops?.at(1) ?? '#ffffff',
          gradientEnd: attrs.fillLinearGradientColorStops?.at(3) ?? '#ff0000',
          gradientOffset: attrs.fillLinearGradientColorStops?.at(2) ?? 1,
          gradientWidth:
            attrs.fillLinearGradientEndPointX ?? attrs.width ?? 100,
        },
        {
          emitEvent: false,
        },
      );
    }
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
    throw Error('Not implemented');
    // const updateEvent = new UpdateShapeEvent({
    //   ...this.event,
    //   previousConfig: this.event.currentConfig,
    //   currentConfig: this.localConfig,
    //   trackHistory: true,
    //   zIndexActions: action
    // });
    // this.presentation.publishEvent(updateEvent);
  }

  applyChanges() {
    if (this.form.value.gradientEnabled) {
      this.localConfig.attrs.fillLinearGradientStartPoint = { x: 0, y: 0 };
      this.localConfig.attrs.fillLinearGradientEndPoint = {
        x: this.form.value.gradientWidth || 100,
        y: 0,
      };
      this.localConfig.attrs.fillLinearGradientColorStops = [
        0,
        this.form.value.gradientStart,
        this.form.value.gradientOffset,
        this.form.value.gradientEnd,
      ];

      this.localConfig.attrs.fill = undefined;
    } else {
      this.localConfig.attrs.fill = this.form.value.fill;
      this.localConfig.attrs.fillLinearGradientColorStops = undefined;
    }
    this.component.updateComponent({ newConfig: this.localConfig });
  }
}
