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
export class ContentEditableSpanDirective implements ControlValueAccessor {
  private onChange = (v: string) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef<HTMLElement>) {}

  writeValue(value: string): void {
    const text = value ?? '';
    if (this.el.nativeElement.innerText !== text) {
      this.el.nativeElement.innerText = text; // use text, not HTML
    }
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.contentEditable = (!isDisabled).toString();
  }

  @HostListener('input')
  handleInput() {
    this.onChange(this.el.nativeElement.innerText);
  }

  @HostListener('blur')
  handleBlur() {
    this.onTouched();
  }

  @HostListener('paste', ['$event'])
  handlePaste(e: ClipboardEvent) {
    // optional: force plain text
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') ?? '';
    document.execCommand('insertText', false, text);
  }
}
