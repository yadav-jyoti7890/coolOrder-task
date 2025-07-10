import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.isLoadingSubject.asObservable();

  private isLocked = false;

  // ✅ Call this when starting a critical API (like Pending Button)
  lock() {
    this.isLocked = true;
    this.isLoadingSubject.next(true);
  }

  // ✅ Call this when response received or dialog closed
  unlock() {
    this.isLocked = false;
    this.isLoadingSubject.next(false);
  }

  // ✅ Interceptor will check this to block other APIs
  get shouldBlockNewRequests(): boolean {
    return this.isLocked;
  }

  // Optional: Can be used to check loader status directly
  get isLoadingNow(): boolean {
    return this.isLoadingSubject.getValue();
  }
}
