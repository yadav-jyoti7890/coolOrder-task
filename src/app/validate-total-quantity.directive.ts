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

  constructor(private el: ElementRef) { }

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

    const currentProduct = currentGroup.controls['flightProductType']?.value;
    const currentQty = +currentGroup.controls['flightOldQty']?.value || 0;
    const inputElement = this.el.nativeElement as HTMLElement;

    // Find matching product from products section
    const matchedProduct = productArray.controls.find((productGroup) => {
      return productGroup.get('product')?.value === currentProduct;
    });

    const allowedQty = +matchedProduct?.get('quantity2')?.value || 0;

    let usedQty = 0;

    flightArray.controls.forEach((flightGroup) => {
      if (flightGroup.get('flightProductType')?.value === currentProduct) {
        usedQty += +flightGroup.get('flightOldQty')?.value || 0;
      }
    });

    // ✅ If product used in flight doesn't exist in product section → ERROR
    if (!matchedProduct) {
      inputElement.style.borderBottom = '2px solid red';
      currentGroup.get('flightProductType')?.setErrors({ invalidProduct: true });
      return;
    }

    // ✅ If values are empty → reset style
    if (!currentProduct || allowedQty === 0 || currentQty === 0) {
      inputElement.style.borderBottom = '1px solid lightgray';
      return;
    }

    // ✅ Validate mismatch in quantity
    if (usedQty !== allowedQty) {
      currentGroup.get('flightOldQty')?.setErrors({ qtyMismatch: true });
    } else {
      currentGroup.get('flightOldQty')?.setErrors(null);
    }

    inputElement.style.borderBottom = usedQty === allowedQty ? '2px solid green' : '2px solid red';

    // ✅ NEW: Check for orphan product (exists in productArray but not used in any flight)
    productArray.controls.forEach(productGroup => {
      const prodName = productGroup.get('product')?.value;
      const matchingFlight = flightArray.controls.find(fg =>
        fg.get('flightProductType')?.value === prodName
      );

      if (!matchingFlight) {
        productGroup.get('product')?.setErrors({ notUsedInFlight: true });
      } else {
        // ✅ Clear the error
        productGroup.get('product')?.setErrors(null);
      }

      // ✅ Force Angular to re-evaluate status immediately
      productGroup.get('product')?.updateValueAndValidity({ emitEvent: false });
    });


  }

}
