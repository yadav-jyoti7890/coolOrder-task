import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { loaderInterceptor } from './order-manage/interceptor/loader-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),

    // ✅ Functional loader interceptor
    provideHttpClient(
      withInterceptors([loaderInterceptor])
    )
  ]
};
