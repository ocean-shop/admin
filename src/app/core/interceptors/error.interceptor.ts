import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToasterService } from '@ui/toaster/toaster.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 400 && error.status < 600) {
        const message = error.error?.message || error.message || 'An unexpected error occurred';
        toasterService.danger(`Error ${error.status}`, message);
      }
      return throwError(() => error);
    }),
  );
};
