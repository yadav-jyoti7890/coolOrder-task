// loader-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { EMPTY } from 'rxjs';
import { BYPASS_LOADER } from './loader-context'; 

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {

  const loaderService = inject(LoaderService);

   // shouldBypass variable decide block the api or not
  const shouldBypass = req.context.get(BYPASS_LOADER);


  if (!shouldBypass && loaderService.shouldBlockNewRequests) {
    // console.log(req)
    return EMPTY;
  }

  return next(req)

};

  // console.log(req)
  // console.log(shouldBypass, `should by pass variable ${shouldBypass}` )
  // console.log(loaderService.shouldBlockNewRequests, `loader ${loaderService.shouldBlockNewRequests}`)
  // console.log(!shouldBypass && loaderService.shouldBlockNewRequests)  
