// src/main.server.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

export default function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      provideRouter(routes)
    ]
  });
}
