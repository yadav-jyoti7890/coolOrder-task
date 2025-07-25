import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class validateUtility {
    static regexValiDator(pattern: RegExp, msg: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if(!control.value) return null
            const isValid = pattern.test(control.value);
            return isValid ? null : {pattern: { message: msg } };
        }
    }
}