import { Component, OnInit } from '@angular/core';
import { CoolorderService } from '../../services/coolorder.service';
import { response } from 'express';
import { error } from 'console';
import { form, order } from '../../interfaces/form-interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LoaderService } from '../../services/loader.service';
import { HttpContext } from '@angular/common/http';
import { BYPASS_LOADER } from '../interceptor/loader-context';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  public orderData: order[] = [];
  public openDioLog: boolean = false;
  public changeData: any[] = []

  public loaderVisibleInDialog = false;


  constructor(private CoolOrderService: CoolorderService, public loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.getAllOrder();
  }

  private getAllOrder() {
    forkJoin([
      this.CoolOrderService.getAllOrderData(),
      this.CoolOrderService.getAllChangeRequest() // <-- Add a method to get all CRs
    ]).subscribe(([orders, crs]) => {
      this.orderData = orders.map((order: order) => {
        const orderCRs = crs.filter((cr: any) => cr.orderId === order.id.toString());
        return {
          ...order,
          hasCR: orderCRs.length > 0
        };
      });


    });
  }

  public delete(id: any) {
    this.CoolOrderService.deleteOrder(id).subscribe({
      next: (response) => {
        alert("delete successfully")
        this.getAllOrder();
      },
      error: (err) => {
        alert("order not delete")
      }
    })
  }

  public showDialog(orderId: any) {
    this.openDioLog = true;
    this.loaderVisibleInDialog = true;
    this.loaderService.lock()
    const byPassContext = new HttpContext().set(BYPASS_LOADER, true)
    setTimeout(() => {
      forkJoin([
        this.CoolOrderService.changeRequestList(orderId, byPassContext),
        this.CoolOrderService.getOrderDataWithId(orderId, byPassContext)
      ]).subscribe({
        next: ([changeRequestData, orderData]) => {
          console.log(changeRequestData, orderData, "api response")
          this.changeData = this.getChangedValueWithOldValue(changeRequestData, orderData);
          // console.log(this.changeData, "compare value")
        },
        error: (err) => {
          // console.error('Error while loading data:', err);
        },
        complete: () => {
          this.loaderService.unlock();
          this.loaderVisibleInDialog = false;
          // console.log("after complete this", this.loaderService, this.loaderVisibleInDialog)
        }
      });
    }, 3000);
  }


  private getChangedValueWithOldValue(cr: any, orderData: any) {
 
    const preViousValue = orderData
    const CR = cr
    const result: any[] = []

    console.log(preViousValue)

    CR.forEach((cr: any, index: number) => {
      const comment = cr.comment;
      const create_at = cr.create_at;
      const newItem = cr.CR
      const changes = []
      // console.log(comment, create_at)

      for (const key in preViousValue) {
        if (key === 'productItems' || key === 'flight') continue

        console.log("🔑 Key Name:", key);
        console.log("📦 Key Value:", preViousValue[key]);

        const oldValue = preViousValue[key]


        if (newItem.hasOwnProperty(key) && newItem !== undefined && newItem !== oldValue) {
          changes.push({ field: key, oldValue: oldValue, newValue: newItem[key] })
        }
      }
      const previousFlight = preViousValue.flight || [];
      // console.log(previousFlight, "flight")
      const currentFlight = newItem.flight || [];
      previousFlight?.forEach((oldItem: any, index: number) => {
        const newItem = currentFlight[index] || {};
        for (const key in oldItem) {
          const oldVal = oldItem[key];
          const newVal = newItem[key];
          if (
            oldItem.hasOwnProperty(key) &&
            newVal !== undefined && oldVal !== undefined &&
            oldVal !== newVal
          ) { changes.push({ field: key, oldValue: oldVal, newValue: newVal }) }
        }
      });

      const product = preViousValue.productItems || [];
      // console.log(product)
      const currentProduct = newItem.productItems || [];
      product?.forEach((oldItem: any, index: number) => {
        const newItem = currentProduct[index] || {};
        for (const key in oldItem) {
          const oldVal = oldItem[key];
          const newVal = newItem[key];
          if (
            newItem.hasOwnProperty(key) &&
            newVal !== undefined &&
            oldVal !== newVal
          ) {
            changes.push({ field: key, oldValue: oldVal, newValue: newVal })
          }
        }
      });

      if (changes.length > 0) {
        result.push({
          changes,
          comment,
          create_at
        })
      }

      // console.log(result, "result")
    })

    return result

  }

  public closeBtn() {
    this.openDioLog = false;
    const byPassContext = new HttpContext().set(BYPASS_LOADER, false)
  }

}
