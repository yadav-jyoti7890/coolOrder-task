import { Injectable } from "@angular/core";


@Injectable({ providedIn: 'root' })
export class LoaderService {

  private isLocked = false;

 
  lock() {
    this.isLocked = true;
  }

  unlock() {
    this.isLocked = false;
  }

 
  get shouldBlockNewRequests(): boolean {
    return this.isLocked;
  }


}
