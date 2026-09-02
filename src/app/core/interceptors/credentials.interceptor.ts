import { HttpInterceptorFn } from '@angular/common/http';
import { API_URL } from '@core/constants/api.constant';

function shouldAttachCredentials(url: string): boolean {
  return url.startsWith(API_URL);
}

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.withCredentials || !shouldAttachCredentials(req.url)) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
