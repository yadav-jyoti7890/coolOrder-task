import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CoolorderService } from '../../services/coolorder.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { flight, form, ProductItem } from '../../form-interface';
import { debounceTime, forkJoin } from 'rxjs';
import { CommonModule, formatDate } from '@angular/common';
import { ValidateBorderDirective } from '../../validator';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ValidateTotalQuantityDirective } from '../../validate-total-quantity.directive';

@Component({
  selector: 'app-copy-order',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    DragDropModule,
    ValidateTotalQuantityDirective,
    RouterLink,
  ],
  templateUrl: './copy-order.component.html',
  styleUrl: './copy-order.component.css',
})
export class CopyOrderComponent implements OnInit {
  @ViewChildren('flightOrgInputs') flightOrgInputs!: QueryList<ElementRef>;
  @ViewChildren('flightDesInputs') flightDesInputs!: QueryList<ElementRef>;

  constructor(
    private coolOrderService: CoolorderService,
    private route: ActivatedRoute,
    private router: Router
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
  public updateId!: string | null;
  public initialFormValues!: any;
  public RouteValid: boolean = false;

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
    this.updateId = this.route.snapshot.paramMap.get('id');
    console.log(this.updateId);
    console.log('Raw ID:', this.route.snapshot.paramMap.get('id'));

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

    this.form.controls.leaseEnd?.valueChanges.subscribe(() =>
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
    this.matchValues();
  }

  private createProductItemGroup(): FormGroup<ProductItem> {
    return new FormGroup<ProductItem>({
      product: new FormControl(null, Validators.required),
      quantity2: new FormControl(null, [
        Validators.pattern('^[0-9]+$'),
        Validators.required,
      ]),
    });
  }

  private matchValues() {
    // const flight = this.form.controls.flight as FormArray<FormGroup<flight>>;

    const org = this.form.controls.org.value;
    const des = this.form.controls.des.value;
    const flightArray = this.form.controls.flight.controls;

    const flights = flightArray.map((flightGroup) => ({
      flightOrg: flightGroup.controls.flightOrg.value,
      flightDes: flightGroup.controls.flightDes.value,
    }));

    const isCompleteRoute = this.isRouteValid(org, des, flights);
    this.form.setErrors(isCompleteRoute.valid ? null : { routeInvalid: true });

    this.RouteValid = isCompleteRoute.valid;

    this.flightOrgInputs.forEach((orgInputRef, index) => {
      const desInputRef = this.flightDesInputs.get(index);
      const color = isCompleteRoute.index.includes(index) ? 'red' : 'green';

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
  ): { valid: boolean; index: number[] } {
    const invalidIndexes: number[] = []; // CREATE THIS FOR STORE INVALID ROUTE

    if (!origin || !destination || flights.length === 0) {
      invalidIndexes.push(0);
      return { valid: false, index: invalidIndexes };
    }

    // console.log(origin, destination, flights)
    for (let i = 1; i < flights.length; i++) {
      const prev = flights[i - 1];
      const current = flights[i];

      if (prev.flightDes !== current.flightOrg) {
        invalidIndexes.push(i);
      }
    }

    const visited = new Set<string>();
    const stack: string[] = [origin];
    let reached = false;

    while (stack.length) {
      const current = stack.pop()!;
      if (current === destination) {
        reached = true;
        break;
      }
      visited.add(current);

      for (const flight of flights) {
        if (flight.flightOrg === current && !visited.has(flight.flightDes)) {
          stack.push(flight.flightDes);
        }
      }
    }

    if (!reached) {
      for (let i = 0; i < flights.length; i++) {
        if (!invalidIndexes.includes(i)) {
          invalidIndexes.push(i);
        }
      }
    }

    return { valid: invalidIndexes.length === 0, index: invalidIndexes };
  }

  public updateProductItems(action: 'add' | 'remove', index?: number) {
    const arr = this.form.controls.productItems as FormArray;
    if (action === 'add') {
      arr.push(this.createProductItemGroup());
    } else if (action === 'remove' && index !== undefined) {
      const removeFromUnique =
        this.form.controls.productItems.controls.at(index)?.value;
      const product = removeFromUnique?.product;

      if (product) {
        this.unique.delete(product);
      }
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
    const controls = this.form.controls.flight as FormArray;
    const previousIndex = controls.at(event.previousIndex);
    const remove = controls.removeAt(event.previousIndex);
    controls.insert(event.currentIndex, previousIndex);
    this.matchValues();
  }

   private calculateLeaseEndDate() {
    // get start date
    const start = this.form.controls.leaseStart.value;
    const end = this.form.controls.leaseEnd.value;

    if(start && end){
      const startDate = new Date(start)
      const endDate = new Date(end)
      // const endDate = new Date(end)

      const startDay = startDate.getDate()
      const endDay = endDate.getDate()
      console.log(startDay, "start" , endDay, "enddate")

      this.form.controls.rentalDays.setValue((endDay - startDay) + 1)
    }
  }

  private fetchData() {
    console.log(this.updateId, 'update id from update ');
    this.coolOrderService.fetchData(this.updateId).subscribe({
      next: (response) => {
        const supplierId = response.supplierId;
        const groupId = response.groupId;

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

          // console.log(this.temp, "temp")

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
          this.selectedValue = response.supplierId;

          const productArray = this.form.controls.productItems as FormArray<
            FormGroup<ProductItem>
          >;
          productArray.clear();
          const items: ProductItem[] = Array.isArray(response.productItems)
            ? response.productItems
            : [];

          items.forEach((item: ProductItem) => {
            productArray.push(
              new FormGroup({
                product: new FormControl(item.product),
                quantity2: new FormControl(item.quantity2),
              })
            );
          });

          const flightArray = this.form.controls.flight as FormArray<
            FormGroup<flight>
          >;
          flightArray.clear();
          const flightItems: flight[] = Array.isArray(response.flight)
            ? response.flight
            : [];

          flightItems.forEach((f: flight) => {
            flightArray.push(
              new FormGroup({
                flightId: new FormControl(f.flightId),
                flightDate: new FormControl(f.flightDate),
                flightOrg: new FormControl(f.flightOrg),
                flightDes: new FormControl(f.flightDes),
                flightProductType: new FormControl(f.flightProductType),
                flightOldQty: new FormControl(f.flightOldQty),
              })
            );
          });
        });
      },
    });
  }

  public submit(status: 'New' | 'draft') {
    // console.log(status)
    // console.log(this.form.invalid, "click submit")

    const formData = {
      ...this.form.value,
      status,
    };
    this.calculateLeaseEndDate();
    console.log(formData);

    if (this.form.valid && this.RouteValid) {
      const today = new Date();
      const formattedDate = today.toISOString().substring(0, 10);

      const formData = {
        ...this.form.value,
        status,
        create_at: formattedDate,
      };

      this.coolOrderService.saveProduct(formData).subscribe({
        next: (res) => {
          console.log(' Data saved:', res);
          alert(`${status} Form submitted successfully`);
          this.router.navigate(['/order-list']);
          this.form.reset();
          this.form.controls.productItems.clear();
          this.form.controls.productItems.push(this.createProductItemGroup());
          this.form.controls.flight.clear();
          this.form.controls.flight.push(this.createFlight());
        },

        error: (err) => {
          console.error('❌ Error saving:', err);
          alert('Error saving data.');
        },
      });
    } else {
      // this.form.markAllAsTouched();
      alert('Please fix the errors before updating.');

      Object.keys(this.form.controls).forEach((key: string) => {
        const control = this.form.get(key);

        if (control instanceof FormControl) {
          // console.log(`Field '${key}' touched:`, control.touched);
          if (control.invalid) {
            control.markAsTouched();
            control.updateValueAndValidity({ onlySelf: true });
          }
        } else if (control instanceof FormArray) {
          control.controls.forEach((row: AbstractControl, index: number) => {
            if (row instanceof FormGroup) {
              Object.keys(row.controls).forEach((fieldName) => {
                const field = row.get(fieldName) as FormControl;
                if (field && field.invalid) {
                  field.markAsTouched();
                  field.updateValueAndValidity({
                    onlySelf: true,
                  });
                }
              });
            }
          });
        }
      });
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
    this.form.controls.straps.reset();
    this.form.controls.precondition.reset();
    this.form.controls.strapsValue.reset();

    const flightArray = this.form.controls.flight as FormArray;

    flightArray.controls.forEach((control) => {
      const group = control as FormGroup;
      group.controls['flightOldQty'].reset();
    });

    this.group = [];
    this.products = [];
    this.options = [];
    this.location = [];
    this.temp = [];

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
        console.log(this.temp);
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

  public reset() {
    this.form.reset({
      supplierId: this.selectedValue,
    });
  }
}
