import { Component, EventEmitter, Output, output } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { flight, form, order, ProductItem } from '../../interfaces/form-interface';
import { debounceTime, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ValidateBorderDirective } from '../../validator';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ValidateTotalQuantityDirective } from '../../validate-total-quantity.directive';
import { CoolorderService } from '../../services/coolorder.service';



@Component({
  selector: 'app-change-request-list',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    DragDropModule,
    ValidateTotalQuantityDirective,
    RouterLink,
  ],
  templateUrl: './change-request-list.component.html',
  styleUrl: './change-request-list.component.css'
})
export class ChangeRequestListComponent {

  // @Output() compareId = new EventEmitter();

  constructor(
    private coolOrderService: CoolorderService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  public supplier: any[] = [];
  public group: any[] = [];
  public products: any[] = [];
  public orderType: any[] = [];
  public location: any[] = [];
  public temp: any[] = [];
  public changeData: any[] = []
  public selectedValue: any;
  public groupId: any;
  public formData: any;
  public form!: FormGroup<form>;
  public options: any[] = [];
  public flightDisable: boolean = false;
  public unique = new Set<string>();
  public updateId!: string | null
  public initialFormValues!: any;
  public RouteValid: boolean = false;
  public changeRequest: any;
  public compareId!: string;
  public openDioLog: boolean = false

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
    this.fetchData()
    this.updateId = this.route.snapshot.paramMap.get('id')
    this.changeRequestList();

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

  }

  public changeRequestList() {
    this.coolOrderService.changeRequestList(this.updateId).subscribe({
      next: (response) => {
        this.changeRequest = response
      }
    })
  }

  private createProductItemGroup(): FormGroup<ProductItem> {
    return new FormGroup<ProductItem>({
      product: new FormControl(null, Validators.required),
      quantity2: new FormControl(null, [Validators.pattern('^[0-9]+$'), Validators.required]),
    });
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

  private fetchData() {
    //////console.log(this.updateId, "update id from update ")
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


          this.form.disable();
          const productArray = this.form.controls.productItems as FormArray<FormGroup<ProductItem>>;
          productArray.clear();
          const items: ProductItem[] = Array.isArray(response.productItems) ? response.productItems : [];

          items.forEach((item: ProductItem) => {
            productArray.push(
              new FormGroup({
                product: new FormControl(item.product),
                quantity2: new FormControl(item.quantity2),
              })
            );
          });

          const flightArray = this.form.controls.flight as FormArray<FormGroup<flight>>;;
          flightArray.clear();
          const flightItems: flight[] = Array.isArray(response.flight) ? response.flight : [];

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

          this.form.controls.productItems.disable()
          this.form.controls.flight.disable()
        });
      },
    });
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
    this.form.controls.straps.reset()
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
      },
    });
  }


  public compareData(changeRequestId:string, orderId:string) {
    this.compareId = changeRequestId;
    if (this.compareId) {
      this.openDioLog = true;
    }
    forkJoin([
      this.coolOrderService.getCompareDataWithId(changeRequestId),
      this.coolOrderService.getOrderDataWithId(orderId)
    ]).subscribe(([changeRequestResponse, orderResponse])=>{
      console.log(changeRequestResponse, orderResponse)
      this.changeData = this.getChangedValueWithOldValue(changeRequestResponse, orderResponse)
    })
  }

  private getChangedValueWithOldValue(cr: any, orderData:any) {
    const preViousValue = orderData
    const CR = cr.CR
    const result = []

    for (const key in preViousValue) {
      if (key === 'productItems' || key === 'flight') continue;

      const preValue = preViousValue[key]

      if (CR.hasOwnProperty(key)) {
        const newValue = CR[key]
        if (preValue != newValue) {
          result.push({
            field: key,
            preValue: preValue,
            newValue: newValue
          })
        }
      }
    }

    const previousFlight = preViousValue.flight || [];
    const currentFlight = CR.flight || [];
    // console.log(currentFlight)

    previousFlight.forEach((oldItem: any, index: number) => {
    
      const newItem = currentFlight[index] || {};
      console.log(newItem)
      console.log(oldItem, "old")

      for (const key in oldItem) {
        const oldVal = oldItem[key];
        const newVal = newItem[key];


        if (
          newItem.hasOwnProperty(key) &&
          newVal !== undefined &&
          oldVal !== newVal
        ) {
          result.push({
            field: key,
            preValue: oldVal,
            newValue: newVal
          });
        }
      }
    });

    const product = preViousValue.productItems || [];
    const currentProduct = CR.productItems || [];

    product.forEach((oldItem: any, index: number) => {

      const newItem = currentProduct[index] || {};
      for (const key in oldItem) {
        const oldVal = oldItem[key];
        const newVal = newItem[key];

        if (
          newItem.hasOwnProperty(key) &&
          newVal !== undefined &&
          oldVal !== newVal
        ) {
          result.push({
            field: key,
            preValue: oldVal,
            newValue: newVal
          });
        }
      }
    });



    return result
  }

  public closeBtn() {
    //////console.log("click")
    this.openDioLog = false;
  }

}
