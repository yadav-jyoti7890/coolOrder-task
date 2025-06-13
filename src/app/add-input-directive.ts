import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDynamicInput]',
  standalone: true
})
export class DynamicInputDirective {
  @Input() dropdownOptions: { id: number | string, name: string }[] = []; // Updated to object
  private counter = 0;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  addInputs(count: number = 1): void {
    // when user click add button new input and select create 
    for (let i = 0; i < count; i++) {
      this.counter++;
      const inputId = `input-${this.counter}`; // first create unique id input-1 for inout
      const selectId = `select-${this.counter}`; // first create unique id select-1 for select

     // create div and append both input and select inside this div
      const wrapper = this.renderer.createElement('div');
      this.renderer.setStyle(wrapper, 'marginBottom', '20px');


      const selectLabel = this.renderer.createElement('label');
      this.renderer.setAttribute(selectLabel, 'for', selectId);
      const selectLabelText = this.renderer.createText(`product*`);
      this.renderer.appendChild(selectLabel, selectLabelText);

     
      const select = this.renderer.createElement('select');
      this.renderer.setAttribute(select, 'id', selectId);
      this.renderer.setStyle(select, 'display', 'block');
      this.renderer.setStyle(select, 'marginTop', '5px');
      this.renderer.setStyle(select, 'padding', '6px');
      this.renderer.addClass(select, 'form-control');

     
      for (const option of this.dropdownOptions) {
        const optionEl = this.renderer.createElement('option');
        this.renderer.setAttribute(optionEl, 'value', option.id.toString());
        const text = this.renderer.createText(option.name); 
        this.renderer.appendChild(optionEl, text);
        this.renderer.appendChild(select, optionEl);
      }

        // create label and set some attribute 

       const wrapper1 = this.renderer.createElement('div');
      this.renderer.setStyle(wrapper1, 'marginBottom', '20px');  

      const inputLabel = this.renderer.createElement('label');
      this.renderer.setAttribute(inputLabel, 'for', inputId);
      const inputLabelText = this.renderer.createText(`Quantity`);
      this.renderer.appendChild(inputLabel, inputLabelText);

      
      const input = this.renderer.createElement('input');
      this.renderer.setAttribute(input, 'type', 'text');
      this.renderer.setAttribute(input, 'id', inputId);
      this.renderer.setStyle(input, 'marginBottom', '10px');
      this.renderer.setStyle(input, 'display', 'block');
      this.renderer.addClass(input, 'form-control');

      this.renderer.appendChild(wrapper, selectLabel);
      this.renderer.appendChild(wrapper, select);
      this.renderer.appendChild(wrapper1, inputLabel);
      this.renderer.appendChild(wrapper1, input);
     

      this.renderer.appendChild(this.el.nativeElement, wrapper);
    }
  }
}
