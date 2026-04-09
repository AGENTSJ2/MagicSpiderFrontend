import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { SelectTextEvent, UpdateTextEvent } from '../../domain/EventModels/textEvent.model';
import { ComponentConfig } from '../../domain/EventModels/presentationEvents.model';

@Component({
  selector: 'app-text-tool-box',
  templateUrl: './text-tool-box.component.html',
  styleUrls: ['./text-tool-box.component.scss']
})
export class TextToolBoxComponent implements OnChanges {

  @Input() event!: SelectTextEvent;
  @Output() update = new EventEmitter<UpdateTextEvent>();

  localConfig!: ComponentConfig<any>; // 👈 native Konva attrs

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event?.currentConfig) {
      this.localConfig = structuredClone(this.event.currentConfig);
    }
  }

  updateField(key: string, value: any) {
    this.localConfig.attrs[key] = value;
  }

  applyChanges() {
    const updateEvent = new UpdateTextEvent({
      ...this.event,
      previousConfig: this.event.currentConfig,
      currentConfig: this.localConfig
    });

    this.update.emit(updateEvent);
  }
}