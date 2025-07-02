import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { form, ProductItem } from '../form-interface';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root',
})
export class CoolorderService {
  private apiUrl = 'http://localhost:3000/';
  constructor(private http: HttpClient) {}

  getSupplier(): Observable<any> {
    return this.http.get(`${this.apiUrl}supplier`);
  }

  getGroup(supplierId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}group?supplierId=${supplierId}`);
  }

  getProduct(GroupId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}products?groupId=${GroupId}`);
  }

  getOrderTypeData(): Observable<any>{
     return this.http.get(`${this.apiUrl}OrderType`);
  }

  getLocation(supplierId:number): Observable<any>{
     return this.http.get(`${this.apiUrl}location?supplierId=${supplierId}`);
  }

  getTemp(groupId:number): Observable<any>{
     return this.http.get(`${this.apiUrl}temp?groupId=${groupId}`);
  }

  saveProduct(data:any){
    console.log(data)
    return this.http.post(`${this.apiUrl}order`, data)
  }

  fetchData(updateId:string|null):Observable<any>{
   return  this.http.get(`${this.apiUrl}order/${updateId}`);
  }

  // update only specific filled using patch method
   
  updateOrder(data:any, updateId:string | null){
    return this.http.patch(`${this.apiUrl}order/${updateId}`, data);
  }

  getAllOrderData():Observable<any>{
    return this.http.get(`${this.apiUrl}order`)
  }

  deleteOrder(id:string | null){
   return this.http.delete(`${this.apiUrl}order/${id}`)
  }
}
