import { Component, OnInit } from '@angular/core';
import { CoolorderService } from '../../services/coolorder.service';
import { response } from 'express';
import { error } from 'console';
import { form, order } from '../../interfaces/form-interface';
import { CommonModule } from '@angular/common';
import {  RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
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
  public showLoaderData!: Subscription


  constructor(private CoolOrderService: CoolorderService, public loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.getAllOrder();
  }

  private getAllOrder() {
    forkJoin([
      this.CoolOrderService.getAllOrderData(),
      this.CoolOrderService.getAllChangeRequest()
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
    this.loaderService.lock()
    this.loaderVisibleInDialog = true;

    const byPassContext = new HttpContext().set(BYPASS_LOADER, true)  
    // console.log(byPassContext, BYPASS_LOADER, "bypasscontext", "BYPASS_LOADER")
    setTimeout(() => {
      console.log("complete 2 minutes")
      this.showLoaderData = forkJoin([
        this.CoolOrderService.changeRequestList(orderId, byPassContext),
        this.CoolOrderService.getOrderDataWithId(orderId, byPassContext)
      ]).subscribe({
        next: ([changeRequestData, orderData]) => {  
          console.log(changeRequestData, orderData, "api response")
          this.changeData = this.getChangedValueWithOldValue(changeRequestData, orderData);
          console.log(this.changeData)
        },
        error: (err) => {
          this.loaderService.unlock();
          this.loaderVisibleInDialog = false;
          console.log("something went wrong")
  
        },
        complete: () => {
          this.loaderService.unlock();
          this.loaderVisibleInDialog = false;
        }
      });
    }, 3000);
  }

  private getChangedValueWithOldValue(cr: any, orderData: any): any[] {
    const result: any[] = [];

    cr.forEach((crItem: any, index: number) => {
      const comment = crItem.comment;
      const create_at = crItem.create_at;
      const newItem = crItem.CR;

      console.log(newItem, index)
      const oldItem = orderData[0]

      console.log(oldItem)

      if (!oldItem || !newItem) return;

      const changes: any[] = [];

      for (const key in newItem) {
        if (key === 'flight' || key === 'productItems') continue;

        const oldVal = oldItem[key];
        const newVal = newItem[key];

        if (newItem.hasOwnProperty(key) && oldVal !== newVal) {
          changes.push({ field: key, oldValue: oldVal, newValue: newVal });
        }
      }

      
      const oldFlights = oldItem.flight || [];
      const newFlights = newItem.flight || [];

      oldFlights.forEach((oldFlight: any, i: number) => {
        const newFlight = newFlights[i] || {};
        for (const key in oldFlight) {
          const oldVal = oldFlight[key];
          const newVal = newFlight[key];
          if (oldVal !== undefined && newVal !== undefined && oldVal !== newVal) {
            changes.push({
              field: key,
              oldValue: oldVal,
              newValue: newVal
            });
          }
        }
      });

      
      const oldProducts = oldItem.productItems || [];
      const newProducts = newItem.productItems || [];

      oldProducts.forEach((oldProduct: any, i: number) => {
        const newProduct = newProducts[i] || {};
        for (const key in oldProduct) {
          const oldVal = oldProduct[key];
          const newVal = newProduct[key];
          if (oldVal !== undefined && newVal !== undefined && oldVal !== newVal) {
            changes.push({
              field: key,
              oldValue: oldVal,
              newValue: newVal
            });
          }
        }
      });


      if (changes.length > 0) {
        result.push({
          comment,
          create_at,
          changes
        });
      }
    });

    return result;
  }

  public closeBtn() {
    this.openDioLog = false
    this.loaderVisibleInDialog = false;
    this.loaderService.unlock();
  }
}
