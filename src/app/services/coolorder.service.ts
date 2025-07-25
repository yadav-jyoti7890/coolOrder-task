import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { form, order, ProductItem } from '../interfaces/form-interface';
import { developMentMode } from '../../assets/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CoolorderService {


  // This is base url for all request 
  private apiUrl = developMentMode.apiUrl;
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

  // get commercial data
  getOrderTypeData(): Observable<any> {
    return this.http.get(`${this.apiUrl}OrderType`);
  }

  // get location by supplier id
  getLocation(supplierId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}location?supplierId=${supplierId}`);
  }

  // get temperature by group id 
  getTemp(groupId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}temp?groupId=${groupId}`);
  }

  // save order 
  saveOrder(data: any) {
    console.log(data)
    return this.http.post(`${this.apiUrl}orders`, data)
  }

  // save order again in log table
  saveOrder_log(data: any) {
    console.log(data)
    return this.http.post(`${this.apiUrl}order_Log`, data)
  }

  // fetch order data by id
  fetchData(updateId: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}orders/${updateId}`);
  }

  // update only specific filled using patch method
  updateOrder(data: any, updateId: string | null) {
    return this.http.patch(`${this.apiUrl}orders/${updateId}`, data);
  }

  // get all order data 
  getAllOrderData(): Observable<any> {
    return this.http.get(`${this.apiUrl}orders`)
  }

  getAllChangeRequest(): Observable<any> {
    return this.http.get(`${this.apiUrl}CR`)
  }

  // get order log data by specific order id 
  getOrderLogData(orderId: string): Observable<any> {
    console.log(orderId)
    return this.http.get(`${this.apiUrl}order_Log?orderId=${orderId}`)
  }

  // delete specific order by id
  deleteOrder(id: string | null) {
    return this.http.delete(`${this.apiUrl}orders/${id}`)
  }

  // create change request 
  createNewCR(CR: any) {
    return this.http.post(`${this.apiUrl}CR`, CR)
  }

  // get change request by order id
  changeRequestList(orderId: string | null, context?: HttpContext) {
    return this.http.get(`${this.apiUrl}CR?orderId=${orderId}`, { context });
  }

  // get change request again by id 
  getCompareDataWithId(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}CR/${id}`)
  }

  // get order data with is
  getOrderDataWithId(id: string, context?: HttpContext): Observable<any> {
    return this.http.get(`${this.apiUrl}orders?id=${id}`, { context })
  }

  // get order with id
  getOrderData(id: string): Observable<any> {
    // console.log(id)
    return this.http.get(`${this.apiUrl}orders?id=${id}`)
  }

  // get all change request by order id
  changeRequestData(id: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}CR?id=${id}`);
  }

  // sorting order data 
  getSortItem(column: string, sortType: 'asc' | 'desc'): Observable<any> {
    return this.http.get<order[]>(`${this.apiUrl}orders?_sort=${column}&_order=${sortType}`);
  }
}
