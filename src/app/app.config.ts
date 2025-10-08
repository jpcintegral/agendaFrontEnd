import { ApplicationConfig, provideZoneChangeDetection ,importProvidersFrom, LOCALE_ID  } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor} from  './interceptors/error.interceptor'
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';



import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes),
        {provide: LOCALE_ID, useValue: 'es',},
        provideHttpClient(),
        importProvidersFrom(BrowserAnimationsModule,
          CalendarModule,
          CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
          })
        ),
        provideHttpClient(withInterceptorsFromDi()), // 
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
};
