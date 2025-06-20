import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { form } from '../form-interface';

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
    return this.http.post(`${this.apiUrl}order`, data)
  }

  fetchData(updateId:number):Observable<any>{
   return  this.http.get(`${this.apiUrl}order/${updateId}`);
  }

  updateOrder(data:any){
   return this.http.put(`${this.apiUrl}order/${6}`, {data});
  }
}
