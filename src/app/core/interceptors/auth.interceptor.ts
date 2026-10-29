import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isApiUrl, isAuthTokenLifecycleUrl } from '@core/helpers/api-url.helper';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getAccessToken();

  // The bearer token is only ever sent to our own API, never to third-party hosts.
  if (!token || !isApiUrl(req.url) || isAuthTokenLifecycleUrl(req.url)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
