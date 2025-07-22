import { HttpContextToken } from '@angular/common/http';

export const BYPASS_LOADER = new HttpContextToken<boolean>(()=> false)