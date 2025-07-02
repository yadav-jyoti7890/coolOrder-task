import { Component, OnInit } from '@angular/core';
import { CoolorderService } from '../../services/coolorder.service';
import { response } from 'express';
import { error } from 'console';
import { form, order } from '../../form-interface';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit{
 public orderData:order[] = [];

 
 constructor(private CoolOrderService: CoolorderService){
 }

  ngOnInit(): void {
    this.getAllOrder();
  }


  getAllOrder(){
    this.CoolOrderService.getAllOrderData().subscribe({
      next: (response) => {
      this.orderData = response;
      console.log(this.orderData, "getAllOrderData")
      }
    })
  }

  delete(id:any){
    this.CoolOrderService.deleteOrder(id).subscribe({
      next: (response) => {
        alert("delete successfully")
        this.getAllOrder();
      },
      error: (err) =>{
        alert("order not delete")
      }
    })
  }
}
