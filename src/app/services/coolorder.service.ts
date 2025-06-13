import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
}
