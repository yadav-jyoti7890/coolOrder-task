import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Directive({
  selector: '[appValidateTotalQuantity]',
})
export class ValidateTotalQuantityDirective implements OnInit {
  @Input('appValidateTotalQuantity') config!: {
    productArray: FormArray;
    flightArray: FormArray;
    currentGroup: FormGroup;
  };

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // console.log(this.config.currentGroup)
    // console.log(this.el, "el"); // return object
    // console.log(this.el.nativeElement, "element"); // return actual element where direct is applied

    this.config.productArray.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.validateAndStyle();
      });

    // For flightArray
    this.config.flightArray.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.validateAndStyle();
      });
  }

  validateAndStyle() {
    const productArray = this.config.productArray;
    const flightArray = this.config.flightArray;
    const currentGroup = this.config.currentGroup;

    // console.log(productArray, "productarray")
    // console.log(flightArray, "flightarray")
    // console.log(currentGroup, "currentfligtgroup")
    // console.log(productArray, "product array")

    const currentProduct = currentGroup.controls['flightProductType']?.value;

    const currentQty = +currentGroup.controls['flightOldQty']?.value || 0;

    // console.log(currentProduct,"current product")
    // console.log(currentQty)
    // console.log(currentProduct)
    // console.log(Array.isArray(productArray.controls), "productArray")

    const matchedProduct = productArray.controls.find((productGroup) => {
      return productGroup.get('product')?.value === currentProduct;
    });

    // console.log(matchedProduct, "match")

    const allowedQty = +matchedProduct?.get('quantity2')?.value || 0;

    //  console.log(allowedQty, "allowedqty")

    let usedQty = 0;

    flightArray.controls.forEach((flightGroup) => {
      if (flightGroup.get('flightProductType')?.value === currentProduct) {
        usedQty += +flightGroup.get('flightOldQty')?.value || 0;
      }
    });

    const inputElement = this.el.nativeElement as HTMLElement;

    if (!currentProduct || allowedQty === 0 || currentQty === 0) {
      inputElement.style.borderBottom = '1px solid lightgray';
      return;
    }

    if (usedQty !== allowedQty) {
      currentGroup.get('flightOldQty')?.setErrors({ qtyMismatch: true });
    } else {
      currentGroup.get('flightOldQty')?.setErrors(null);
    }

    if (usedQty === allowedQty) {
      inputElement.style.borderBottom = '2px solid green';
    } else {
      inputElement.style.borderBottom = '2px solid red';
    }
  }
}
