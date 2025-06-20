import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
import { debounceTime } from 'rxjs';
import { Console } from 'node:console';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-coolorder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    DragDropModule,
    ValidateTotalQuantityDirective,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './coolorder.component.html',
  styleUrl: './coolorder.component.css',
})
export class CoolorderComponent implements OnInit {
  @ViewChildren('flightOrgInputs') flightOrgInputs!: QueryList<ElementRef>;
  @ViewChildren('flightDesInputs') flightDesInputs!: QueryList<ElementRef>;

  constructor(
    private coolOrderService: CoolorderService,
    private fb: FormBuilder,
    private el: ElementRef
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
  public flightDisable: boolean = false;
  public unique = new Set<string>();

  ngOnInit(): void {
    this.getSupplier();
    this.getOrderType();

    this.form = new FormGroup<form>({
      orderType: new FormControl(null, [Validators.required]),
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
      commodity: new FormControl(null, Validators.required),
      precondition: new FormControl(false),
      straps: new FormControl(false),
      preconditionDropDownValue: new FormControl(null),
      preconditionInputValue: new FormControl(null),
      strapsValue: new FormControl(null),
      groupId: new FormControl(null, Validators.required),
      locationId: new FormControl(null, Validators.required),
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

    console.log(this.form.controls, 'controls');

    this.form.controls.leaseStart?.valueChanges.subscribe(() =>
      this.calculateLeaseEndDate()
    );

    this.form.controls.rentalDays?.valueChanges.subscribe(() =>
      this.calculateLeaseEndDate()
    );

    this.form.controls.flight.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.matchValues();
      });

    // this.form.controls.flight.valueChanges
    //   .pipe(debounceTime(500))
    //   .subscribe(() => {
    //     this.matchValues();
    //   });

    this.form.controls.org.valueChanges
      .pipe(debounceTime(800))
      .subscribe(() => {
        this.matchValues();
      });

    this.form.controls.des.valueChanges
      .pipe(debounceTime(800))
      .subscribe(() => {
        this.matchValues();
      });

    // this.form.controls.flight.valueChanges
    //   .pipe(debounceTime(500)) // Wait 500ms after typing stops
    //   .subscribe(() => {
    //     this.validateAndStyle();
    //   });

    // this.form.controls.productItems.valueChanges
    //   .pipe(debounceTime(500))
    //   .subscribe(() => {
    //     this.validateAndStyle();
    //   });
  }

  private createProductItemGroup(): FormGroup {
    return new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity2: new FormControl(null, [Validators.pattern('^[0-9]+$')]),
    });
  }

  private matchValues() {
    const org = this.form.controls.org.value;
    const des = this.form.controls.des.value;
    const flightArray = this.form.controls.flight.controls;

    const flights = flightArray.map((flightGroup) => ({
      flightOrg: flightGroup.controls.flightOrg.value,
      flightDes: flightGroup.controls.flightDes.value,
    }));

    // console.log(flights)
    const isCompleteRoute = this.isRouteValid(org, des, flights);
    this.flightDisable = isCompleteRoute;

    this.form.setErrors(isCompleteRoute ? null : { routeInvalid: true });

    this.flightOrgInputs.forEach((orgInputRef, index) => {
      //  console.log( orgInputRef, index)  // console.log(this.flightDesInputs)
      const desInputRef = this.flightDesInputs.get(index);
      const flight = flightArray[index];
      console.log(flight);

      const color = isCompleteRoute ? 'green' : 'red';

      if (orgInputRef?.nativeElement) {
        orgInputRef.nativeElement.style.borderBottom = `2px solid ${color}`;
      }

      if (desInputRef?.nativeElement) {
        desInputRef.nativeElement.style.borderBottom = `2px solid ${color}`;
      }
    });
  }

  private isRouteValid(
    origin: string | null,
    destination: string | null,
    flights: any[]
  ): boolean {
    if (!origin || !destination || flights.length === 0) return false;

    const firstFlight = flights[0];
    const firstOrigin = firstFlight.flightOrg;
    const firstDes = firstFlight.flightDes;

    for (let i = 1; i < flights.length; i++) {
      const prevFlight = flights[i - 1];
      const currentFlight = flights[i];

      if (
        currentFlight.flightOrg === firstOrigin ||
        currentFlight.flightDes === firstOrigin
      ) {
        return false;
      }

      if (prevFlight.flightDes !== currentFlight.flightOrg) {
        return false;
      }
    }

    const visited = new Set<string>();
    const stack: string[] = [origin];

    while (stack.length) {
      const current = stack.pop()!;
      if (current === destination) return true;
      if (visited.has(current)) continue;

      visited.add(current);
      for (const flight of flights) {
        if (flight.flightOrg === current && !visited.has(flight.flightDes)) {
          stack.push(flight.flightDes);
        }
      }
    }

    return false;
  }

  public updateProductItems(action: 'add' | 'remove', index?: number) {
    // //.log(action, index);
    const arr = this.form.controls.productItems as FormArray;
    if (action === 'add') {
      //.log(action);
      arr.push(this.createProductItemGroup());
    } else if (action === 'remove' && index !== undefined) {
      const removeFromUnique =
        this.form.controls.productItems.controls.at(index)?.value;
      const product = removeFromUnique?.product;

      if (product) {
        this.unique.delete(product);
      }
      console.log(this.unique);
      arr.removeAt(index);
    }
  }

  private createFlight(data: any = {}): FormGroup {
    const flight = new FormGroup({
      flightId: new FormControl(data.flightId || '', Validators.required),
      flightDate: new FormControl(data.flightDate || '', Validators.required),
      flightOrg: new FormControl(data.flightOrg || '', Validators.required),
      flightDes: new FormControl(data.flightDes || '', Validators.required),
      flightProductType: new FormControl('', Validators.required),
      flightOldQty: new FormControl('', Validators.required),
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
    // //.log(newFromGroupWithCopiedValue)
    this.form.controls.flight.push(newFromGroupWithCopiedValue);
  }

  public drop(event: any) {
    const controls = this.form.controls.flight as FormArray;
    // get the specific form group from form array
    const previousIndex = controls.at(event.previousIndex);
    //.log(previousIndex);
    const remove = controls.removeAt(event.previousIndex);
    // //.log(remove, "remove")
    controls.insert(event.currentIndex, previousIndex);
    // //.log(controls.insert(event.currentIndex, previousIndex))
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
    this.groupId = event.target.value as HTMLSelectElement;
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
    if (this.form.valid) {
      const formData = this.form.value;

      this.coolOrderService.saveProduct(formData).subscribe({
        next: (res) => {
          console.log(' Data saved:', res);
          alert('Form submitted successfully!');
          this.form.reset();
        },
        error: (err) => {
          console.error('❌ Error saving:', err);
          alert('Error saving data.');
        },
      });
    } else {
      alert('Please fill the form correctly.');
    }
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

 


}
