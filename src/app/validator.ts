import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';

@Directive({
  selector: '[appValidateBorder]',
  standalone: true,
})
export class ValidateBorderDirective implements OnInit {
  // access property from parent component where this uses
  @Input('appValidateBorder') control!: FormControl;

  private errorElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (!this.control) {
      console.warn('FormControl not passed to directive');
      return;
    }

    this.showError();

    // console.log(this.control.value, 'value of controller');
    this.control.valueChanges.subscribe(() => {
      this.updateBorder();
      this.showError();
    });
    this.control.statusChanges.subscribe(() => this.updateBorder());

    this.renderer.listen(this.el.nativeElement, 'blur', () => {
      this.control.markAsTouched();
      this.updateBorder();
      this.showError();
    });
  }

  private updateBorder() {
    const inputEl = this.el.nativeElement as HTMLElement;
    const parent = inputEl.parentNode;

   
    if (this.errorElement) {
      this.renderer.removeChild(parent, this.errorElement);
      this.errorElement = null!;
    }


    if (this.control.valid && (this.control.dirty || this.control.touched)) {
      inputEl.style.borderBottom = '3px solid green';
    } else if (
      this.control.invalid &&
      (this.control.dirty || this.control.touched)
    ) {
      inputEl.style.borderBottom = '2px solid red';
      this.errorElement = this.renderer.createElement('div');
      const errorMsg = this.showError()
      const text = this.renderer.createText(errorMsg);
      this.renderer.appendChild(this.errorElement, text)
      this.renderer.setStyle(this.errorElement, 'color', 'red');
      this.renderer.setStyle(this.errorElement, 'fontSize', '12px');
      this.renderer.setStyle(this.errorElement, 'marginTop', '4px');

      this.renderer.appendChild(parent, this.errorElement);
      
    } else {
      inputEl.style.borderBottom = '1px solid #ccc';
    }
  }

  private showError(): string {
    if (!this.control.errors) return '';

    if (this.control.errors['required']) return 'This field is required';
    if (this.control.errors['pattern']) return 'Only numbers allowed';
    if (this.control.errors['minlength'])
      return `Minimum ${this.control.errors['minlength'].requiredLength} characters required`;
    if (this.control.errors['maxlength'])
      return `Maximum ${this.control.errors['maxlength'].requiredLength} characters allowed`;

    return 'Invalid input';
  }
}
