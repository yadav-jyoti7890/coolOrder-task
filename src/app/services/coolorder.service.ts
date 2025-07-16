import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { form, ProductItem } from '../interfaces/form-interface';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root',
})
export class CoolorderService {


  private apiUrl = 'http://localhost:3000/'; // This is base url for all request 
  constructor(private http: HttpClient) { }

  // first get all supplier
  getSupplier(): Observable<any> {
    return this.http.get(`${this.apiUrl}supplier`);
  }

  // get all group data by supplier id
  getGroup(supplierId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}group?supplierId=${supplierId}`);
  }

  // get product by group id
  getProduct(GroupId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}products?groupId=${GroupId}`);
  }

  getOrderTypeData(): Observable<any> {
    return this.http.get(`${this.apiUrl}OrderType`);
  }

  getLocation(supplierId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}location?supplierId=${supplierId}`);
  }

  getTemp(groupId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}temp?groupId=${groupId}`);
  }

  saveOrder(data: any) {
    console.log(data)
    return this.http.post(`${this.apiUrl}order`, data)
  }

  saveOrder_log(data: any) {
    console.log(data)
    return this.http.post(`${this.apiUrl}order_Log`, data)
  }

  fetchData(updateId: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}order/${updateId}`);
  }

  // update only specific filled using patch method

  updateOrder(data: any, updateId: string | null) {
    return this.http.patch(`${this.apiUrl}order/${updateId}`, data);
  }

  getAllOrderData(): Observable<any> {
    return this.http.get(`${this.apiUrl}order`)
  }

  getAllChangeRequest(): Observable<any> {
    return this.http.get(`${this.apiUrl}CR`)
  }

  getOrderLogData(orderId: string): Observable<any> {
    console.log(orderId)
    return this.http.get(`${this.apiUrl}order_Log?orderId=${orderId}`)
  }

  deleteOrder(id: string | null) {
    return this.http.delete(`${this.apiUrl}order/${id}`)
  }

  createNewCR(CR: any) {
    return this.http.post(`${this.apiUrl}CR`, CR)
  }

  changeRequestList(orderId: string | null, context?: HttpContext) {
    return this.http.get(`${this.apiUrl}CR?orderId=${orderId}`, { context });
  }

  getCompareDataWithId(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}CR/${id}`)
  }

  getOrderDataWithId(id: string, context?: HttpContext): Observable<any> {
    return this.http.get(`${this.apiUrl}order?id=${id}`, { context })
  }

  getOrderData(id: string): Observable<any> {
    // console.log(id)
    return this.http.get(`${this.apiUrl}order?id=${id}`)
  }

  changeRequestData(id: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}CR?id=${id}`);
  }

  // sorting api

  getSortItem(column: string, sortType: string): Observable<any> {
    console.log(column, sortType)
    return this.http.get(`${this.apiUrl}order?_sort=${column}&_order=${sortType}`);
  }
}
