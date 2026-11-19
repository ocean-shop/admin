import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '@core/constants/loader.constants';
import { LoaderService } from '../../services/loader/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  const loaderService = inject(LoaderService);

  loaderService.show();

  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    }),
  );
};
