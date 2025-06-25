import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface ProductItem {
  product: FormControl<string | null>;
  quantity2: FormControl<string | null>;
}

export interface flight {
  flightId: FormControl<number | null>;
  flightDate: FormControl<Date | null>;
  flightOrg: FormControl<string | null>;
  flightDes: FormControl<string | null>;
  flightProductType: FormControl<string | null>;
  flightOldQty: FormControl<number | null>;
}

export interface form {
  orderType: FormControl<string | null>;
  org: FormControl<string | null>;
  des: FormControl<string | null>;
  pickUpPort: FormControl<string | null>;
  rentalDays: FormControl<string | null>;
  returnPort: FormControl<string | null>;
  leaseStart: FormControl<string | null>;
  leaseEnd: FormControl<string | null>;
  groupId: FormControl<string | null>;
  productCode: FormControl<string | null>;
  // productId: FormControl<string | null>;
  commodity: FormControl<string | null>;
  precondition: FormControl<boolean | null>;
  straps: FormControl<boolean | null>;
  supplierId: FormControl<string | null>;
  locationId: FormControl<string | null>;
  preconditionDropDownValue: FormControl<string | null>;
  preconditionInputValue: FormControl<string | null>;
  strapsValue: FormControl<string | null>;
  productItems: FormArray<FormGroup<ProductItem>>;
  flight: FormArray<FormGroup<flight>>;
}
