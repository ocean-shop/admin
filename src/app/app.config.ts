import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { QUERY_CLIENT_DEFAULT_OPTIONS } from '@core/constants/query-client.constants';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loaderInterceptor } from '@core/interceptors/loader.interceptor';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';
import { LoaderService } from '@core/services/loader/loader.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor,
        authInterceptor,
        loaderInterceptor,
        errorInterceptor,
      ]),
    ),
    provideTanStackQuery(new QueryClient({ defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS })),
    provideAppInitializer(() => {
      inject(LoaderService);
    }),
  ],
};
