import { Component } from '@angular/core';
import { CoolorderService } from '../../../services/coolorder.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { flight, form, ProductItem } from '../../../interfaces/form-interface';
import { forkJoin, take, takeUntil } from 'rxjs';
import { ValidateBorderDirective } from '../../../validator';
import { CommonModule } from '@angular/common';
import { OtherInformationComponent } from '../other-information/other-information.component';
import { FlightDetailComponent} from '../flight-detail/flight-detail.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ChangeRequestListComponent } from '../change-request-list/change-request-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionCleaner } from '../../../shared/unsubscribe/subscription-cleaner';

@Component({
  selector: 'app-read-order',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    TranslateModule
  ],
  templateUrl: './read-order.component.html',
  styleUrl: './read-order.component.css'
})
export class ReadOrderComponent extends SubscriptionCleaner{


  constructor(
    private coolOrderService: CoolorderService,
    private route: ActivatedRoute,
    private router: Router
  ) { super(); }

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
  public orderId!: string | null;
  public initialFormValues!: any;
  public RouteValid: boolean = false
  public currentRoute:any = OtherInformationComponent
  public selectedCompareId: string = '';
  public showCompare = false;
  public activeTab:string = 'other'



  ngOnInit(): void {
    forkJoin([
      this.coolOrderService.getSupplier(),
      this.coolOrderService.getOrderTypeData(),
    ]).pipe(takeUntil(this.subscriptions$)).subscribe(([supplierRes, orderTypeRes]) => {
      this.supplier = supplierRes;
      this.orderType = orderTypeRes;
      this.fetchData();
    });

    this.getGroupBySupplierId(this.selectedValue);
    this.getLocation();
    // this.fetchData()
    this.orderId = this.route.snapshot.paramMap.get('id');
    // console.log(this.orderId)
    // console.log('Raw ID:', this.route.snapshot.paramMap.get('id'));


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
    console.log(this.orderId, "update id from update ")
    this.coolOrderService.fetchData(this.orderId).subscribe({
      next: (response) => {
        const supplierId = response.supplierId;
        const groupId = response.groupId;

        forkJoin({
          group: this.coolOrderService.getGroup(supplierId),
          product: this.coolOrderService.getProduct(groupId),
          location: this.coolOrderService.getLocation(supplierId),
          temp: this.coolOrderService.getTemp(groupId),
        }).pipe(takeUntil(this.subscriptions$)).subscribe((all) => {
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
    this.coolOrderService.getLocation(this.selectedValue).pipe(takeUntil(this.subscriptions$)).subscribe({
      next: (response) => {
        this.location = response;
      },
    });
  }

  public getGroupBySupplierId(supplierId: any) {
    this.coolOrderService.getGroup(supplierId).pipe(takeUntil(this.subscriptions$)).subscribe({
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
    this.coolOrderService.getProduct(this.groupId).pipe(takeUntil(this.subscriptions$)).subscribe({
      next: (response) => {
        this.products = response;
        this.options = this.products.map((item) => item.name);
      },
    });
  }

  private getTemp() {
    this.coolOrderService.getTemp(this.groupId).pipe(takeUntil(this.subscriptions$)).subscribe({
      next: (response) => {
        this.temp = response;
      },
    });
  }

  public setComponent(route:string){
    this.activeTab = route
    this.showCompare = true
   if(route == 'Change'){
     this.currentRoute = ChangeRequestListComponent
   }
   else if(route == 'flight'){
    this.currentRoute = FlightDetailComponent
   }
   else if(route == 'product'){
    this.currentRoute = ProductDetailComponent
   }
   else{
   this.currentRoute = OtherInformationComponent
   }
  }

}
