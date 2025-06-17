import { Component, OnInit, ViewChild } from '@angular/core';
import { CoolorderService } from '../services/coolorder.service';
import { CommonModule, formatDate } from '@angular/common';
import { response } from 'express';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { flight, form, ProductItem } from '../form-interface';
import { ValidateBorderDirective } from '../validator';

import { AddInputService } from '../services/add-input.service';
import { matchULDQtyWithTotalQuantity } from '../add-input-directive';
import { ValidateTotalQuantityDirective } from '../validate-total-quantity.directive';

@Component({
  selector: 'app-coolorder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    DragDropModule,
    ValidateTotalQuantityDirective
  ],
  templateUrl: './coolorder.component.html',
  styleUrl: './coolorder.component.css',
})
export class CoolorderComponent implements OnInit {
  constructor(
    private coolOrderService: CoolorderService,
    private fb: FormBuilder,
    private addInputService: AddInputService
  ) {}

  public supplier: any[] = [];
  public group: any[] = [];
  public products: any[] = [];
  public orderType: any[] = [];
  public location: any[] = [];
  public temp: any[] = [];
  public selectedValue: any;
  public groupId: any;
  public formData: any;
  public form!: FormGroup<form>;
  public options: any[] = [];

  ngOnInit(): void {
    this.getSupplier();
    this.getOrderType();

    this.form = new FormGroup<form>({
      org: new FormControl(null, [Validators.required]),
      des: new FormControl(null, Validators.required),
      pickUpPort: new FormControl(null, Validators.required),
      rentalDays: new FormControl(null, [
        Validators.required,
        Validators.maxLength(3),
        Validators.pattern('^[0-9]*$'),
      ]),
      returnPort: new FormControl(null, Validators.required),
      leaseStart: new FormControl(null, Validators.required),
      leaseEnd: new FormControl(null, Validators.required),
      supplierId: new FormControl(null, Validators.required),
      productId: new FormControl(null, Validators.required),
      groupId: new FormControl(null, Validators.required),
      locationId: new FormControl(null, Validators.required),
      commodity: new FormControl(null, Validators.required),
      precondition: new FormControl(false),
      straps: new FormControl(false),
      preconditionDropDownValue: new FormControl(null, Validators.required),
      preconditionInputValue: new FormControl(null, Validators.required),
      strapsValue: new FormControl(null, Validators.required),
      productCode: new FormControl(null, [
        Validators.required,
        Validators.maxLength(5),
        Validators.pattern('^[0-9]*$'),
      ]),

      // create form array for multiple product
      productItems: new FormArray<FormGroup<ProductItem>>([
        this.createProductItemGroup(),
      ]),
      flight: new FormArray<FormGroup<flight>>([this.createFlight()]),
    });

    this.form.controls.leaseStart?.valueChanges.subscribe(() =>
      this.calculateLeaseEndDate()
    );

    this.form.controls.rentalDays?.valueChanges.subscribe(() =>
      this.calculateLeaseEndDate()
    );

    // this.form.controls.flight.valueChanges.subscribe(()=>{
    //   console.log("flight value change")
    // })


  }

  private createProductItemGroup(): FormGroup {
    return new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity2: new FormControl(null, [Validators.pattern('^[0-9]+$')]),
    });
  }

  public updateProductItems(action: 'add' | 'remove', index?: number) {
    // //.log(action, index);
    const arr = this.form.controls.productItems as FormArray;
    if (action === 'add') {
      //.log(action);
      arr.push(this.createProductItemGroup());
    } else if (action === 'remove' && index !== undefined) {
      //.log(action, index);
      arr.removeAt(index);
    }
  }

  private createFlight(data: any = {}): FormGroup {
    const flight = new FormGroup({
      flightId: new FormControl(data.flightId || '', Validators.required),
      flightDate: new FormControl(data.flightDate || '', Validators.required),
      flightOrg: new FormControl(data.flightOrg || '', Validators.required),
      flightDes: new FormControl(data.flightDes || '', Validators.required),
      flightProductType: new FormControl(''),
      flightOldQty: new FormControl(''),
    });

    return flight;
  }

  public addFlight(action: 'addFlight' | 'removeFlight', index?: number) {
    //.log('add flight');
    const arr = this.form.controls.flight as FormArray;
    if (action == 'addFlight') {
      arr.push(this.createFlight());
    } else if (action === 'removeFlight' && index !== undefined) {
      arr.removeAt(index);
    }
  }

  // 1. copy previous value and create new formArray
  // 2. user click copy so send the exist index (like 1/2/3)
  public copyValue(i: number) {
    const currentGroup = this.form.controls.flight.at(i) as FormGroup;
    const copiedValue = currentGroup.value;
    const newFromGroupWithCopiedValue = this.createFlight(copiedValue);
    // console.log(newFromGroupWithCopiedValue)
    this.form.controls.flight.push(newFromGroupWithCopiedValue);
  }

  public getAllFormGroup() {}

  public drop(event: any) {
    const controls = this.form.controls.flight as FormArray;
    // get the specific form group from form array
    const previousIndex = controls.at(event.previousIndex);
    console.log(previousIndex);
    const remove = controls.removeAt(event.previousIndex);
    // console.log(remove, "remove")
    controls.insert(event.currentIndex, previousIndex);
    // console.log(controls.insert(event.currentIndex, previousIndex))
  }

  private calculateLeaseEndDate() {
    // get start date
    const start = this.form.controls.leaseStart.value;
    // get rentalDays in a number format
    const rentalDays = parseInt(this.form.controls.rentalDays.value || '0', 10);
    ////.log(rentalDays);

    // check if value null or empty
    if (start && !isNaN(rentalDays)) {
      const startDate = new Date(start);
      ////.log(startDate);
      const endDate = new Date(startDate);
      ////.log(endDate);
      endDate.setDate(startDate.getDate() + rentalDays); //getdate-> gets the day of the month from start date

      const formattedDate = formatDate(endDate, 'yyyy-MM-dd', 'en-US'); //
      this.form.controls.leaseEnd.setValue(formattedDate);
    }
  }

  private getSupplier() {
    this.coolOrderService.getSupplier().subscribe({
      next: (response) => {
        this.supplier = response;
      },
    });
  }

  public getSupplierId(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedValue = selectElement.value;
    this.form.reset({
      supplierId: this.selectedValue,
    });
    this.getGroupBySupplierId(this.selectedValue);
    this.getLocation();
  }

  public getGroupBySupplierId(supplierId: any) {
    this.coolOrderService.getGroup(supplierId).subscribe({
      next: (response) => {
        this.group = response;
      },
    });
  }

  public getProductByGroupId(event: any) {
    ////.log('group id');
    this.groupId = event.target.value as HTMLSelectElement;
    ////.log(this.groupId, 'groupId');
    this.getProductsById();
    this.getTemp();
  }

  public getProductsById() {
    this.coolOrderService.getProduct(this.groupId).subscribe({
      next: (response) => {
        this.products = response;
        ////.log(this.products, 'products');
        this.options = this.products.map((item) => item.name);
      },
    });
  }

  public getOrderType() {
    this.coolOrderService.getOrderTypeData().subscribe({
      next: (response) => {
        ////.log(response);
        this.orderType = response;
      },
    });
  }

  private getLocation() {
    this.coolOrderService.getLocation(this.selectedValue).subscribe({
      next: (response) => {
        this.location = response;
        ////.log(this.location, 'location get by supplier id');
      },
    });
  }

  public submit() {
    this.formData = this.form.value;
  }

  public reset() {
    this.form.reset();
  }

  private getTemp() {
    ////.log(this.groupId);
    this.coolOrderService.getTemp(this.groupId).subscribe({
      next: (response) => {
        this.temp = response;
        ////.log('temp', response);
      },
    });
  }

  //   public submit() {
  //   if (this.form.invalid) {
  //     ////.log('🚫 Form is invalid. See which fields are invalid:');
  //     this.checkInvalidControls(this.form);
  //     return;
  //   }
  //   this.formData = this.form.value
  //   this.form.reset

  //   ////.log('✅ Form is valid! Submitting...');
  //   ////.log(this.form.value);
  // }

  // checkInvalidControls(formGroup: FormGroup | FormArray, path: string = ''): void {
  //   Object.keys(formGroup.controls).forEach(key => {
  //     const controlPath = path ? `${path}.${key}` : key;
  //     const control = formGroup.get(key);

  //     if (control instanceof FormControl) {
  //       if (control.invalid) {
  //         ////.warn(`❌ Invalid field: ${controlPath}`, control.errors);
  //       }
  //     } else if (control instanceof FormGroup || control instanceof FormArray) {
  //       this.checkInvalidControls(control, controlPath);
  //     }
  //   });
  // }
}
