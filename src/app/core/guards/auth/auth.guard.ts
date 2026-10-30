import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  if (authService.hasSessionHint()) {
    return authService.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        authService.clearSession();
        return of(router.createUrlTree([APP_ROUTES.LOGIN]));
      }),
    );
  }

  return router.createUrlTree([APP_ROUTES.LOGIN]);
};
