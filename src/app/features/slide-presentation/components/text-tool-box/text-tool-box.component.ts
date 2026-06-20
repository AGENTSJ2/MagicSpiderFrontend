import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ComponentConfig,
  ZIndexActions,
} from '../../domain/EventModels/presentationEvents.model';
import { Subscription } from 'rxjs';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import {
  TextToolboxConfig,
} from '../../domain/canvasModels/textComponent.model';
import { Text, TextConfig } from 'konva/lib/shapes/Text';
import { ICanvasComponent } from '../../domain/canvasModels/ICanvasComponent';
import { getFormattedText } from '../../../../core/utilities';

@Component({
  selector: 'app-text-tool-box',
  templateUrl: './text-tool-box.component.html',
  styleUrls: ['./text-tool-box.component.scss'],
})
export class TextToolBoxComponent implements OnChanges {
  @Input() presentation!: Presentation;
  @Input() component!: ICanvasComponent;
  localConfig!: ComponentConfig<TextToolboxConfig>;
  form!: FormGroup;
  private sub?: Subscription;
  private updateTimeOut: any;
  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
  }

  initForm() {
    const attrs = (this.component?.node as Text)?.toObject()
      .attrs as TextToolboxConfig;
    if (!attrs) {
      return;
    }
    this.localConfig = {
      attrs: attrs,
      zIndex: this.component.node.zIndex(),
    };
    const isGradientEnabled = attrs.fill == undefined;
    this.sub?.unsubscribe();
    if (!this.form) {
      this.form = this.fb.group({
        text: [attrs.rawText ?? attrs.text],
        x: [attrs.x ?? 0],
        y: [attrs.y ?? 0],
        fontFamily: [attrs.fontFamily],
        fontStyle: [attrs.fontStyle],
        fontSize: [attrs.fontSize],
        lineHeight: [attrs.lineHeight],
        rotation: [attrs.rotation ?? 0],
        fill: [attrs.fill],
        align: [attrs.align],
        stroke: [attrs.stroke || '#000000'],
        strokeWidth: [attrs.strokeWidth || 0],
        listType: [attrs.listType || 'none'],
        bulletStyle: [attrs.bulletStyle || 'disc'],
        numberStyle: [attrs.numberStyle || 'decimal'],
        gradientEnabled: [isGradientEnabled],
        gradientStart: [attrs.fillLinearGradientColorStops?.at(1) ?? '#000000'],
        gradientEnd: [attrs.fillLinearGradientColorStops?.at(3) ?? '#ff0000'],
        gradientOffset: [attrs.fillLinearGradientColorStops?.at(2) ?? 1],
        gradientWidth: attrs.fillLinearGradientEndPointX,
      });
    } else {
      this.form.patchValue(
        {
          ...this.localConfig.attrs,
          x: this.localConfig.attrs.x ?? 0,
          y: this.localConfig.attrs.y ?? 0,
          text: attrs.rawText ?? attrs.text,
          rotation: attrs.rotation ?? 0,
          listType: attrs.listType || 'none',
          bulletStyle: attrs.bulletStyle || 'disc',
          numberStyle: attrs.numberStyle || 'decimal',
        },
        {
          emitEvent: false,
        },
      );
    }
    this.listenToChanges();
  }

  listenToChanges() {
    this.sub = this.form.valueChanges.subscribe((values) => {
      Object.assign(this.localConfig.attrs, values);
      (this.localConfig.attrs as any).rawText = values.text;
      this.localConfig.attrs.text = getFormattedText(
        values.text,
        values.listType,
        values.bulletStyle,
        values.numberStyle,
      );
      clearTimeout(this.updateTimeOut);
      this.updateTimeOut = setTimeout(() => {
        this.applyChanges();
      }, 200);
    });
  }
  ZIndexActions = ZIndexActions;
  move(action: ZIndexActions) {
    this.component.updateComponent({
      newConfig: this.localConfig,
      zIndexActions: action,
    });
  }

  applyChanges() {
    if (this.form.value.gradientEnabled) {
      this.localConfig.attrs.fillLinearGradientStartPoint = { x: 0, y: 0 };
      this.localConfig.attrs.fillLinearGradientEndPoint = {
        x: this.form.value.gradientWidth || 200,
        y: 0,
      };
      this.localConfig.attrs.fillLinearGradientColorStops = [
        0,
        this.form.value.gradientStart,
        this.form.value.gradientOffset,
        this.form.value.gradientEnd,
      ];
      this.localConfig.attrs.fill = undefined; // important
    } else {
      this.localConfig.attrs.fill = this.form.value.fill;
    }
    this.component.updateComponent({
      newConfig: this.localConfig,
    });
  }
 
}
