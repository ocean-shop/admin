import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loaderInterceptor } from '@core/interceptors/loader.interceptor';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { credentialsInterceptor } from '@core/interceptors/credentials.interceptor';
import { LoaderService } from '@core/services/loader/loader.service';

import { routes } from './app.routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

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
    provideTanStackQuery(queryClient),
    provideAppInitializer(() => {
      inject(LoaderService);
    }),
  ],
};
