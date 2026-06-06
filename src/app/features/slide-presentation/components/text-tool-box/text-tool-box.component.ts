import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ComponentConfig,
  ZIndexActions,
} from '../../domain/EventModels/presentationEvents.model';
import { Subscription } from 'rxjs';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import {
  BulletStyle,
  ListType,
  NumberStyle,
  TextComponent,
  TextToolboxConfig,
} from '../../domain/canvasModels/textComponent.model';
import { TextConfig } from 'konva/lib/shapes/Text';
import { ICanvasComponent } from '../../domain/canvasModels/ICanvasComponent';

@Component({
  selector: 'app-text-tool-box',
  templateUrl: './text-tool-box.component.html',
  styleUrls: ['./text-tool-box.component.scss'],
})
export class TextToolBoxComponent implements OnChanges {
  @Input() presentation!: Presentation;
  @Input() component!: ICanvasComponent;
  localConfig!: ComponentConfig<TextConfig>;
  form!: FormGroup;
  private sub?: Subscription;
  private updateTimeOut: any;
  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
  }

  initForm() {
    const nodeClone = this.component.node.toObject();
    this.localConfig = {
      attrs: nodeClone.attrs,
      zIndex: this.component.node.zIndex(),
    };
    const attrs = this.localConfig.attrs as any;
    console.log(attrs.rawText);
    
    const isGradientEnabled = attrs.fill == undefined;
    this.sub?.unsubscribe();
    if (!this.form) {
      this.form = this.fb.group({
        text: [attrs.rawText ?? attrs.text],
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
  }

  listenToChanges() {
    this.sub = this.form.valueChanges.subscribe((values) => {
      Object.assign(this.localConfig.attrs, values);
      (this.localConfig.attrs as any).rawText = values.text;
      this.localConfig.attrs.text = this.getFormattedText(
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
    throw Error('Not implemented');
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
    throw Error('Not implemented');
    // const updateEvent = new UpdateTextEvent({
    //   ...this.event,
    //   previousConfig: this.event.currentConfig,
    //   currentConfig: this.localConfig,
    //   trackHistory: true
    // });
    // this.presentation.publishEvent(updateEvent);
  }

  private getFormattedText(
    text = '',
    listType: ListType = 'none',
    bulletStyle: BulletStyle = 'disc',
    numberStyle: NumberStyle = 'decimal',
  ): string {
    if (listType === 'none') {
      return text;
    }

    let itemNumber = 0;
    return text
      .split('\n')
      .map((line) => {
        if (!line.trim()) {
          return line;
        }

        itemNumber += 1;
        if (listType === 'bullet') {
          return `${this.getBulletMarker(bulletStyle)} ${line}`;
        }

        return `${this.getNumberMarker(itemNumber, numberStyle)} ${line}`;
      })
      .join('\n');
  }

  private getBulletMarker(style: BulletStyle): string {
    const markers: Record<BulletStyle, string> = {
      disc: '•',
      circle: '◦',
      square: '▪',
      dash: '-',
      check: '✓',
    };
    return markers[style];
  }

  private getNumberMarker(value: number, style: NumberStyle): string {
    switch (style) {
      case 'lower-alpha':
        return `${this.getAlphaMarker(value, false)}.`;
      case 'upper-alpha':
        return `${this.getAlphaMarker(value, true)}.`;
      case 'lower-roman':
        return `${this.getRomanMarker(value).toLowerCase()}.`;
      case 'upper-roman':
        return `${this.getRomanMarker(value)}.`;
      default:
        return `${value}.`;
    }
  }

  private getAlphaMarker(value: number, upperCase: boolean): string {
    let result = '';
    let current = value;
    while (current > 0) {
      current -= 1;
      result = String.fromCharCode(97 + (current % 26)) + result;
      current = Math.floor(current / 26);
    }
    return upperCase ? result.toUpperCase() : result;
  }

  private getRomanMarker(value: number): string {
    const numerals: Array<[number, string]> = [
      [1000, 'M'],
      [900, 'CM'],
      [500, 'D'],
      [400, 'CD'],
      [100, 'C'],
      [90, 'XC'],
      [50, 'L'],
      [40, 'XL'],
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I'],
    ];
    let current = value;
    let result = '';
    for (const [amount, numeral] of numerals) {
      while (current >= amount) {
        result += numeral;
        current -= amount;
      }
    }
    return result;
  }
}
