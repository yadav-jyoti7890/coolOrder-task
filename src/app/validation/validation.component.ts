import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidateBorderDirective } from '../validator';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [ValidateBorderDirective,  RouterLink,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ValidateBorderDirective],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.css'
})
export class ValidationComponent {
  @Input() control!: FormControl;
  @Input() type!: string 
  @Input() placeholder: string = '';

  get errorMessage(): string {
    if (
      !this.control ||
      !this.control.errors ||
      !(this.control.touched || this.control.dirty)
    )
      return '';
    if (this.control.errors['required']) return `This Filed is required`;
    if (this.control.errors['email']) return 'Invalid email format';
   
    if (this.control.errors['minlength']) {
      const required = this.control.errors['minlength'].requiredLength;
      return `must be at least ${required} characters`;
    }

    if (this.control.errors['maxlength']) {
      return `Maximum ${this.control.errors['maxlength'].requiredLength} characters allowed.`;
    }

    if (this.control.errors['pattern']) {
      return 'only number allowed';
    }

    if (this.control.errors['max']) {
      return `Maximum allowed value is ${this.control.errors['max'].max}`;
    }

    return 'Invalid value';
  }

}
