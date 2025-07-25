import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsyncService {
  private apiUrl = 'http://localhost:3000/';

  constructor(private http:HttpClient) {}

  // Example method to fetch data asynchronously
  fetchData(key:string, value:string){
    console.log(key + value, "key and value");
    return this.http.get(`${this.apiUrl}orders?${key}=${value}`);
  }


}
