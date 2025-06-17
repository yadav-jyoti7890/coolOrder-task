// uld-qty.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export function matchULDQtyWithTotalQuantity(quantity: number, parentArray: FormArray): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !parentArray) return null;

    let total = 0;

    parentArray.controls.forEach(group => {
      const val = +group.get('flightOldQty')?.value || 0;
      total += val;
    });

    if (total !== quantity) {
      return { qtyMismatch: true };
    }

    return null;
  };
}
