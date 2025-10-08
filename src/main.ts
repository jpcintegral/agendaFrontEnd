import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs); 

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),    
    provideAnimations(),
    ...appConfig.providers
  ]
}).catch(err => console.error(err));
