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
import { ShapeType } from '../../domain/canvasModels/shapeComponent.model';

@Component({
  selector: 'app-shape-tool-box',
  templateUrl: './shape-tool-box.component.html',
  styleUrls: ['./shape-tool-box.component.scss','../text-tool-box/text-tool-box.component.scss'],
})
export class ShapeToolBoxComponent implements OnChanges {
  @Input() presentation!: Presentation;
  @Input() component!: ICanvasComponent;

  form!: FormGroup;
  localConfig!: ComponentConfig<ShapeConfig>;
  private sub?: Subscription;
  private updateTimeOut: any;
  ShapeType = ShapeType;
  shapeType?:ShapeType;
  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
  }

  initForm() {
    const attrs = this.component?.node.toObject().attrs;
    this.shapeType = (this.component as any)?.shapeType;    
    if(!attrs)
    {
      return
    }
    this.localConfig = {
      attrs: attrs,
      zIndex: this.component.node.zIndex(),
    };
    const isGradientEnabled = attrs.fill == undefined;
    if (!this.form) {
      this.form = this.fb.group({
        x: [attrs.x],
        y: [attrs.y],
        width: [this.component.node.width()],
        height: [this.component.node.height()],
        radius:[(attrs as any).radius],
        rotation: [this.component.node.rotation()],
        opacity: [attrs.opacity],
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
          x: this.component.node.x(),
          y: this.component.node.y(),
          width: this.component.node.width(),
          height: this.component.node.height(),
          radius: (attrs as any).radius,
          rotation: this.component.node.rotation(),
          opacity: attrs.opacity,
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
    this.listenToChanges();
  }

  listenToChanges() {
    this.sub?.unsubscribe();
    this.sub = this.form.valueChanges.subscribe((values) => {
      Object.assign(this.localConfig.attrs, this.sanitizeValues(values));
      clearTimeout(this.updateTimeOut);
      this.updateTimeOut = setTimeout(() => {
        this.applyChanges();
      }, 200);
    });
  }

  private sanitizeValues(values: Record<string, any>): Record<string, any> {
    const attrs: Record<string, any> = { ...values };
    // Toolbox-only controls; applyChanges() translates these into fill /
    // fillLinearGradient* attrs itself.
    // delete attrs['gradientEnabled'];
    // delete attrs['gradientStart'];
    // delete attrs['gradientEnd'];
    // delete attrs['gradientOffset'];
    // delete attrs['gradientWidth'];
    // delete attrs['fill'];

    if (this.shapeType == ShapeType.CIRCLE) {
      delete attrs['width'];
      delete attrs['height'];
      delete attrs['cornerRadius'];
    } else {
      delete attrs['radius'];
    }

    for (const key of Object.keys(attrs)) {
      const value = attrs[key];
      if (
        value == null ||
        (typeof value === 'number' && !Number.isFinite(value))
      ) {
        delete attrs[key];
      }
    }
    return attrs;
  }

  ZIndexActions = ZIndexActions;

  move(action: ZIndexActions) {
    this.component.updateComponent({newConfig:this.localConfig,zIndexActions:action})
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
