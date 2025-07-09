import { Component, OnInit } from '@angular/core';
import { CoolorderService } from '../../services/coolorder.service';
import { response } from 'express';
import { error } from 'console';
import { form, order } from '../../interfaces/form-interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

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


  constructor(private CoolOrderService: CoolorderService) {
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
    forkJoin([
      this.CoolOrderService.changeRequestList(orderId),
      this.CoolOrderService.getOrderDataWithId(orderId)
    ]).subscribe(([changeRequestResponse, orderResponse]) => {
      // console.log(changeRequestResponse, orderResponse)
      this.changeData = this.getChangedValueWithOldValue(changeRequestResponse, orderResponse)
      setTimeout(() => {
        this.openDioLog = true
      }, 1000)
      console.log(this.changeData.length)
    })
  }

  private getChangedValueWithOldValue(cr: any, orderData: any): any {
    const preViousValue = orderData
    const CR = cr
    const result: any[] = []

    console.log(CR)

    CR.forEach((cr: any, index: number) => {
      const comment = cr.comment;
      const create_at = cr.create_at;
      const newItem = cr.CR
      const changes = []

      console.log(comment, create_at)

      for (const key in preViousValue) {
        if (key === 'productItems' || key === 'flight') continue

        const oldValue = preViousValue[key]
        if (newItem.hasOwnProperty(key) && newItem !== undefined && newItem !== oldValue) {
          changes.push({ field: key, oldValue: oldValue, newValue: newItem[key] })

        }
      }

      const previousFlight = preViousValue.flight || [];
      // console.log(previousFlight)
      const currentFlight = newItem.flight || [];
      previousFlight.forEach((oldItem: any, index: number) => {
        const newItem = currentFlight[index] || {};

        for (const key in oldItem) {
          const oldVal = oldItem[key];
          const newVal = newItem[key];

          if (
            oldItem.hasOwnProperty(key) &&
            newVal !== undefined && oldVal !== undefined &&
            oldVal !== newVal
          ) {
            changes.push({ field: key, oldValue: oldVal, newValue: newVal })

          }
        }
      });

      const product = preViousValue.productItems || [];

      const currentProduct = newItem.productItems || [];

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

    })

    return result

  }

  public closeBtn() {
    this.openDioLog = false;
  }





}
