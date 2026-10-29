import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import {
  HTTP_ERROR_LOG_SCOPE,
  HTTP_ERROR_TEXTS,
  RETRIED_AFTER_REFRESH,
} from '@core/constants/http-error.constants';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { isApiUrl, isAuthApiUrl, isAuthTokenLifecycleUrl } from '@core/helpers/api-url.helper';
import { logDebug } from '@core/helpers/debug-log.helper';
import { buildHttpErrorToast, isHttpErrorStatus } from '@core/helpers/http-error.helper';
import { AuthService } from '../services/auth/auth.service';
import { ToasterService } from '../services/toaster/toaster.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toasterService = inject(ToasterService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const alreadyRetried = req.context.get(RETRIED_AFTER_REFRESH);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      logDebug(HTTP_ERROR_LOG_SCOPE, 'Request failed', {
        status: error.status,
        url: req.url,
        alreadyRetried,
      });

      // Only our own API may trigger a refresh: a 401 from a third party says nothing about our session.
      const shouldRefreshSession =
        error.status === HttpStatusCode.Unauthorized &&
        isApiUrl(req.url) &&
        !isAuthApiUrl(req.url) &&
        !alreadyRetried;

      if (shouldRefreshSession) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            if (!response?.accessToken) {
              logDebug(HTTP_ERROR_LOG_SCOPE, 'Refresh response is missing access token');
              return throwError(() => new Error(HTTP_ERROR_TEXTS.MISSING_ACCESS_TOKEN));
            }

            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${response.accessToken}` },
                context: req.context.set(RETRIED_AFTER_REFRESH, true),
              }),
            );
          }),
          catchError((refreshError) => {
            authService.clearSession();
            router.navigate([APP_ROUTES.LOGIN]);
            return throwError(() => refreshError);
          }),
        );
      }

      if (isHttpErrorStatus(error.status) && !isAuthTokenLifecycleUrl(req.url)) {
        const { title, message } = buildHttpErrorToast(error);
        toasterService.danger(title, message);
      }

      if (error.status === HttpStatusCode.Forbidden) {
        router.navigate([APP_ROUTES.NOT_PERMISSION]);
      }

      return throwError(() => error);
    }),
  );
};
