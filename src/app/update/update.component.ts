import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { flight, form, ProductItem } from '../form-interface';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CoolorderService } from '../services/coolorder.service';
import { debounceTime, forkJoin } from 'rxjs';
import { CommonModule, formatDate } from '@angular/common';
import { ValidateTotalQuantityDirective } from '../validate-total-quantity.directive';
import { ValidateBorderDirective } from '../validator';
import { response } from 'express';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-update',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    DragDropModule,
    ValidateTotalQuantityDirective,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.css',
})
export class UpdateComponent {
  @ViewChildren('flightOrgInputs') flightOrgInputs!: QueryList<ElementRef>;
  @ViewChildren('flightDesInputs') flightDesInputs!: QueryList<ElementRef>;

  constructor(
    private coolOrderService: CoolorderService,
    private fb: FormBuilder,
    private el: ElementRef,
    private route: ActivatedRoute
  ) { }

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
  public updateId!: number;
  public initialFormValues!: any;
  public showErrors: boolean = false;

  ngOnInit(): void {
    forkJoin([
      this.coolOrderService.getSupplier(),
      this.coolOrderService.getOrderTypeData(),
    ]).subscribe(([supplierRes, orderTypeRes]) => {
      this.supplier = supplierRes;
      this.orderType = orderTypeRes;
      this.fetchData();
    });

    this.getGroupBySupplierId(this.selectedValue);
    this.getLocation();
    // this.fetchData()
    this.updateId = Number(this.route.snapshot.paramMap.get('id'));
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

    this.initialFormValues = this.form.value;

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
  }

  private createProductItemGroup(): FormGroup {
    return new FormGroup({
      product: new FormControl(null, Validators.required),
      quantity2: new FormControl(null, [
        Validators.pattern('^[0-9]+$'),
        Validators.required,
      ]),
    });
  }

  private matchValues() {
    const formArray = this.form.controls.flight as FormArray;
    
    const flights = formArray.controls.map((ctrl: any) => ({
      flightOrg: ctrl.controls.flightOrg.value,
      flightDes: ctrl.controls.flightDes.value
    }));

    const mainOrigin = this.form.controls.org.value;
    const mainDest = this.form.controls.des.value;

    const { valid, visitedOrgs } = this.isRouteValid(flights, mainOrigin, mainDest);
    console.log(valid, visitedOrgs)

    this.flightOrgInputs.forEach((orgRef, index) => {
      const desRef = this.flightDesInputs.get(index);
      const org = formArray.at(index).get('flightOrg')?.value;
      const des = formArray.at(index).get('flightDes')?.value;

      const color = valid && visitedOrgs.has(org) ? 'green' : 'red';

      if (orgRef?.nativeElement) {
        orgRef.nativeElement.style.borderBottom = `2px solid ${color}`;
      }
      if (desRef?.nativeElement) {
        desRef.nativeElement.style.borderBottom = `2px solid ${color}`;
      }
    });
  }

  private isRouteValid(flights: any[], mainOrigin: string | null | any, mainDest: string | null): { valid: boolean, visitedOrgs: Set<string> } {
    // if (flights.length === 0) return { valid: false, visitedOrgs: new Set() };

    const originMap = new Map<string, any>();
    const destSet = new Set<string>();

    flights.forEach(flight => {
      originMap.set(flight.flightOrg, flight);
      destSet.add(flight.flightDes);
    });

      console.log(originMap, destSet)


    // Force start from mainOrigin
    let currentFlight = originMap.get(mainOrigin);
    // console.log(currentFlight, !currentFlight)
    if (!currentFlight) return { valid: false, visitedOrgs: new Set() };

    const visited = new Set<string>();

    while (currentFlight) {
      if (visited.has(currentFlight.flightOrg)) {
        return { valid: false, visitedOrgs: visited };
      }

      visited.add(currentFlight.flightOrg);

      if (currentFlight.flightDes === mainDest) {
        visited.add(currentFlight.flightDes);
        return { valid: visited.size === flights.length + 1, visitedOrgs: visited };
      }

      currentFlight = originMap.get(currentFlight.flightDes);
    }

    return { valid: false, visitedOrgs: visited };
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
      //.log(this.unique);
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

  public copyValue(i: number) {
    const currentGroup = this.form.controls.flight.at(i) as FormGroup;
    const copiedValue = currentGroup.value;
    const newFromGroupWithCopiedValue = this.createFlight(copiedValue);
    // //.log(newFromGroupWithCopiedValue)
    this.form.controls.flight.push(newFromGroupWithCopiedValue);
  }

  public drop(event: any) {
    console.log(event, 'event');
    const controls = this.form.controls.flight as FormArray;
    const previousIndex = controls.at(event.previousIndex);
    const remove = controls.removeAt(event.previousIndex);
    controls.insert(event.currentIndex, previousIndex);
    this.matchValues();
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

  private fetchData() {
    this.coolOrderService.fetchData(this.updateId).subscribe({
      next: (response) => {
        const supplierId = response.supplierId;
        const groupId = response.groupId;

        //.log(supplierId, groupId);

        forkJoin({
          group: this.coolOrderService.getGroup(supplierId),
          product: this.coolOrderService.getProduct(groupId),
          location: this.coolOrderService.getLocation(supplierId),
          temp: this.coolOrderService.getTemp(groupId),
        }).subscribe((all) => {
          this.group = all.group;
          this.products = all.product;
          this.options = this.products.map((item) => item.name);
          this.location = all.location;
          this.temp = all.temp;

          // patch basic values
          this.form.patchValue({
            orderType: response.orderType,
            org: response.org,
            des: response.des,
            pickUpPort: response.pickUpPort,
            rentalDays: response.rentalDays,
            returnPort: response.returnPort,
            leaseStart: response.leaseStart,
            leaseEnd: response.leaseEnd,
            supplierId: response.supplierId,
            commodity: response.commodity,
            precondition: response.precondition,
            straps: response.straps,
            preconditionDropDownValue: response.preconditionDropDownValue,
            preconditionInputValue: response.preconditionInputValue,
            strapsValue: response.strapsValue,
            groupId: response.groupId,
            locationId: response.locationId,
            productCode: response.productCode,
          });

          const productArray = this.form.controls.productItems as FormArray;
          productArray.clear();
          const items = Array.isArray(response.productItems)
            ? response.productItems
            : [];

          items.forEach((item: any) => {
            productArray.push(
              new FormGroup({
                product: new FormControl(item.product, Validators.required),
                quantity2: new FormControl(item.quantity2, [
                  Validators.pattern('^[0-9]+$'),
                ]),
              })
            );
          });

          const flightArray = this.form.controls.flight as FormArray;
          flightArray.clear();
          const flightItems = Array.isArray(response.flight)
            ? response.flight
            : [];

          flightItems.forEach((f: any) => {
            flightArray.push(
              new FormGroup({
                flightId: new FormControl(f.flightId, Validators.required),
                flightDate: new FormControl(f.flightDate, Validators.required),
                flightOrg: new FormControl(f.flightOrg, Validators.required),
                flightDes: new FormControl(f.flightDes, Validators.required),
                flightProductType: new FormControl(
                  f.flightProductType,
                  Validators.required
                ),
                flightOldQty: new FormControl(
                  f.flightOldQty,
                  Validators.required
                ),
              })
            );
          });
        });
      },
    });
  }

  public update() {
    if (this.form.valid) {
      console.log('form is invalid', this.form.valid);
      console.log('click update');
      const updateData: any = {}; // STORE DIRTY DATA!

      //CONVERT OBJECT INTO ARRAY !
      Object.keys(this.form.controls).forEach((key: string) => {
        const control = this.form.get(key);

        if (control instanceof FormControl) {
          if (control.dirty) {
            updateData[key] = control.value;
          }
        } else if (control instanceof FormArray) {
          const dirtyArray: any[] = [];
          control.controls.forEach((row: AbstractControl, index: number) => {
            if (row instanceof FormGroup) {
              const dirtyGroup: any = {};

              Object.keys(row.controls).forEach((fieldName) => {
                const field = row.controls[fieldName];

                if (field?.dirty) {
                  dirtyGroup[fieldName] = field.value;
                }
              });

              if (Object.keys(dirtyGroup).length > 0) {
                dirtyArray[index] = dirtyGroup;
              }
            }
          });

          if (dirtyArray.length > 0) {
            updateData[key] = dirtyArray;
          }
        }
      });
      console.log('Dirty updated data:', updateData);
    } 
    else {
      this.form.markAllAsTouched();
      Object.keys(this.form.controls).forEach((key: string) => {
        const control = this.form.get(key);

        if (control instanceof FormControl) {
          console.log(`Field '${key}' touched:`, control.touched);
          if (control.invalid && control.touched) {
            control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
            // console.log(`Field '${key}' is invalid and should show error`);
          }
        }
        else if (control instanceof FormArray) {
          control.controls.forEach((row: AbstractControl, index: number) => {
            if (row instanceof FormGroup) {
              Object.keys(row.controls).forEach((fieldName) => {
                const field = row.get(fieldName) as FormControl;
                  console.log(`Field [${key}][${index}].${fieldName} touched:`, field.touched);
                if (field && field.invalid && field.touched) {
                  field.updateValueAndValidity({
                    onlySelf: true,
                    emitEvent: true,
                  });
                }
              });
            }
          });
        }
      });

      alert('All required fields are highlighted!');
    }
  }

  public getSupplierId(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedValue = selectElement.value;

    const productArray = this.form.controls.productItems as FormArray;
    while (productArray.length !== 0) {
      productArray.removeAt(0);
    }

    this.form.controls.productCode.reset();
    this.form.controls.groupId.reset();
    this.form.controls.locationId.reset();

    const flightArray = this.form.controls.flight as FormArray;

    flightArray.controls.forEach((control) => {
      const group = control as FormGroup;
      group.controls['flightOldQty'].reset();
    });

    this.group = [];
    this.products = [];
    this.options = [];

    productArray.push(this.createProductItemGroup());
    this.getGroupBySupplierId(this.selectedValue);
    this.getLocation();
  }

  private getLocation() {
    this.coolOrderService.getLocation(this.selectedValue).subscribe({
      next: (response) => {
        this.location = response;
      },
    });
  }

  public getGroupBySupplierId(supplierId: any) {
    this.coolOrderService.getGroup(supplierId).subscribe({
      next: (response) => {
        this.group = response;
        //.log(response.id, this.group)
        this.groupId = response.id;
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
        this.options = this.products.map((item) => item.name);
      },
    });
  }

  private getTemp() {
    this.coolOrderService.getTemp(this.groupId).subscribe({
      next: (response) => {
        this.temp = response;
      },
    });
  }

  public disabled(productName: string, currentIndex: number): boolean {
    for (let i = 0; i < this.form.controls.productItems.length; i++) {
      if (i !== currentIndex) {
        const Row = this.form.controls.productItems.at(i);
        const selectedValue = Row.controls.product.value;
        if (selectedValue === productName) {
          return true;
        }
      }
    }
    return false;
  }
}
