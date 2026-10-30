import { HttpInterceptorFn } from '@angular/common/http';
import { isApiUrl } from '@core/helpers/api-url/api-url.helper';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.withCredentials || !isApiUrl(req.url)) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
