// loader-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { EMPTY } from 'rxjs';
import { BYPASS_LOADER } from './loader-context'; 

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  // ✅ Agar context me BYPASS_LOADER = true hai, to allow karo
  const shouldBypass = req.context.get(BYPASS_LOADER);

  if (!shouldBypass && loaderService.shouldBlockNewRequests) {
    console.warn('❌ API call blocked because loader is locked.');
    return EMPTY;
  }

  // ✅ Proceed with request
  return next(req);
};
