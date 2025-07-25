import { AfterViewInit, Directive, DoCheck, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl } from '@angular/forms';


@Directive({
  selector: '[appCustomValidator]'
})

export class CustomValidatorDirective implements AfterViewInit {

  @Input('appCustomValidator') control: AbstractControl | null = null;
  private errorElement: HTMLElement | null = null;
  public message!: string;

  constructor(private el: ElementRef, private render: Renderer2) { }

  ngAfterViewInit(): void {
    this.createContainer();
  }

  private createContainer() {
    console.log(this.control, "control")
    if (this.control) {
      this.errorElement = this.render.createElement('div');
      this.render.addClass(this.errorElement, 'error');
      this.render.setStyle(this.errorElement, 'color', 'red');
      this.render.setStyle(this.errorElement, 'font-size', '12px');
      this.render.setStyle(this.errorElement, 'margin-top', '5px');
      this.render.setStyle(this.errorElement, 'display', 'none');
      this.render.appendChild(this.el.nativeElement.parentNode, this.errorElement);
    }
    this.control?.statusChanges.subscribe(() => {
      this.disPlayErrorMessage();
    }
    );
  }

  private disPlayErrorMessage() {
    if (this.control) {
      const control = this.control;
      console.log(control, "control")
      const isValid = control.invalid && (control.dirty || control.touched);
      // console.log(isValid, "isValid")
      if (isValid) {
        const errMsg = this.getMessage(this.control)
        if (errMsg) {
          this.render.setStyle(this.errorElement, 'display', 'block');
          this.render.setProperty(this.errorElement, 'textContent', errMsg);
        }
      }
      else {
        this.render?.setStyle(this.errorElement, 'display', 'none');
      }
    }
  }

  private getMessage(control: AbstractControl): any {
    let msg = '';
    if (this.control) {
      const control = this.control;
      // console.log(control, "control")
      for (const errorKey in control.errors) {
        console.log(errorKey, "errorKey")
        if (control.errors.hasOwnProperty(errorKey)) {
          switch (errorKey) {
            case 'required':
              msg = 'This field is required';
              break;
            case 'minlength':
              msg = `Minimum length is ${control.errors['minlength'].requiredLength}`;
              break;
            case 'maxlength':
              msg = `Maxlength is ${control.errors['maxlength'].requiredLength}`;
              break;
            case 'max':
              msg = `Maximum value is ${control.errors['max'].max}`;
              break;
            case 'min':
              msg = `Minimum value is ${control.errors['min'].min}`;
              break;
            case 'pattern':
              msg = control.errors['pattern'].message || 'Invalid format';
              break;
            case 'asyncError':
              msg = control.errors['asyncError']|| 'Invalid format';
              break;
            default:
              msg = 'Invalid input';
              break;
          }
        }
      }
    }
    return msg;
  }

}


