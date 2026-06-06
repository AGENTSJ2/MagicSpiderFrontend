import { Directive, ElementRef, forwardRef, HostListener, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[contentEditableModel]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContentEditableSpanDirective),
      multi: true
    }
  ]
})
export class ContentEditableSpanDirective implements ControlValueAccessor, OnInit {
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.contentEditable = 'true';
  }

  @HostListener('input')
  onInput() {
    this.onChange(this.el.nativeElement.innerText);
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  writeValue(value: string) {
    this.el.nativeElement.innerText = value ?? '';
  }

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.el.nativeElement.contentEditable = String(!isDisabled);
  }
}