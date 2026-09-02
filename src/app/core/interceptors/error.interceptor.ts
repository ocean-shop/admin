import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToasterService } from '../services/toaster/toaster.service';
import { AuthService } from '../services/auth/auth.service';

const RETRIED_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const alreadyRetried = req.context.get(RETRIED_AFTER_REFRESH);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const shouldHandleUnauthorized =
        error.status === 401 && !req.url.includes('/auth/') && !alreadyRetried;

      logAuthDebug('Request failed', {
        status: error.status,
        url: req.url,
        alreadyRetried,
      });

      if (shouldHandleUnauthorized) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            if (!response?.accessToken) {
              logAuthDebug('Refresh response is missing access token');
              return throwError(() => new Error('Missing access token in refresh response'));
            }

            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
              context: req.context.set(RETRIED_AFTER_REFRESH, true),
            });
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            authService.clearSession();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      if (error.status >= 400 && error.status < 600) {
        if (!req.url.includes('/refresh') && !req.url.includes('/logout')) {
          const message =
            error.error?.message || error.message || 'Сталася непередбачувана помилка';
          toasterService.danger(`Error ${error.status}`, message);
        }
      }

      if (error.status === 403) {
        router.navigate(['/admin/not-permission']);
      }
      return throwError(() => error);
    }),
  );
};

function logAuthDebug(message: string, data?: unknown): void {
  if (!isDevMode()) {
    return;
  }

  if (data) {
    console.debug(`[AuthInterceptor] ${message}`, data);
    return;
  }

  console.debug(`[AuthInterceptor] ${message}`);
}
