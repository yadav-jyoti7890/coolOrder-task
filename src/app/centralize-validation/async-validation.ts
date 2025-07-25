import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { AsyncService } from '../services/async.service';

@Injectable({ providedIn: 'root' })
export class asyncValidation {
  public cache = new Map<string, number[]>();
  constructor(private async: AsyncService) { }

  public asyncValidator(key: string, message: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      if (!control.value) {
        //console.log(control.value, "control.value")
        return of(null)
      }

      let i = 1;
      if (control.value.length <= 3) {
        console.log(control.value.length, i)
        return of(null)
      }

      const composite = `${key}-${control.value}`;
      if (this.cache.has(composite)) {
        //console.log("cache data")
        return of({ asyncError: message })
      }

      return of(control.value).pipe(
        switchMap((val: string) => {
          return this.async.fetchData(key, val).pipe(
            map((response: any) => {
              this.cache.set(composite, response[0]?.[key])
              //console.log(response)
              return response.length > 0 ? { asyncError: message } : null;
            })
          );
        })
      );
    };
  }
}
