import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { AsyncService } from '../services/async.service';

@Injectable({ providedIn: 'root' })
export class asyncValidation {
  constructor(private async: AsyncService) { }

  public asyncValidator(key: string, message: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = control.value;
      return of(value).pipe(
        debounceTime(1000), 
        switchMap((val: string) => {
          return this.async.fetchData(key, val).pipe(
            map((response: any) => {
              console.log(response)
              return response.length > 0
                ? { asyncError: message }
                : null;
            })
          );
        })
      );
    };
  }
}
