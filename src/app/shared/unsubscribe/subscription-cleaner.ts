import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export abstract class SubscriptionCleaner implements OnDestroy {

    protected subscriptions$ = new Subject<void>();

    ngOnDestroy(): void {
        console.log('Cleaning up subscriptions...');
        // Emit a value to complete all subscriptions
        this.subscriptions$.next();
        this.subscriptions$.complete();
    }

}