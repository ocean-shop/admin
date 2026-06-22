import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToasterService } from '../services/toaster/toaster.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
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
          const message = error.error?.message || error.message || 'An unexpected error occurred';
          toasterService.danger(`Error ${error.status}`, message);
        }
      }
      return throwError(() => error);
    }),
  );
};
