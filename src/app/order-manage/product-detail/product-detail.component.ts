import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ValidateBorderDirective } from '../../validator';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { CoolorderService } from '../../services/coolorder.service';
import { flight, form, ProductItem } from '../../interfaces/form-interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    ValidateBorderDirective,
    RouterLink,
    RouterOutlet,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
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

    this.updateId = this.route.snapshot.paramMap.get('id');
    // console.log(this.updateId)
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

      productItems: new FormArray<FormGroup<ProductItem>>([
        this.createProductItemGroup(),
      ]),

      flight: new FormArray<FormGroup<flight>>([this.createFlight()]),
    });
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

          // patch basic values
          this.form.patchValue({
            supplierId: response.supplierId,
            groupId: response.groupId,
            productCode: response.productCode,
          });

          this.selectedValue = response.supplierId;

          this.form.disable();
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

          this.form.controls.productItems.disable();
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

    productArray.push(this.createProductItemGroup());
    this.getGroupBySupplierId(this.selectedValue);
  }

  public getGroupBySupplierId(supplierId: any) {
    this.coolOrderService.getGroup(supplierId).subscribe({
      next: (response) => {
        this.group = response;
        this.groupId = response.id;
      },
    });
  }

  public getProductByGroupId(event: any) {
    this.groupId = event.target.value as HTMLSelectElement;
    this.getProductsById();
  }

  public getProductsById() {
    this.coolOrderService.getProduct(this.groupId).subscribe({
      next: (response) => {
        this.products = response;
        this.options = this.products.map((item) => item.name);
      },
    });
  }
}
