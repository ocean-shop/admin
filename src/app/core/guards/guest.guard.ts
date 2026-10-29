import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { AuthService } from '../services/auth/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree([APP_ROUTES.ADMIN]);
  }

  if (authService.hasSessionHint()) {
    return authService.refreshToken().pipe(
      map(() => router.createUrlTree([APP_ROUTES.ADMIN])),
      catchError(() => {
        authService.clearSession();
        return of(true);
      }),
    );
  }

  return true;
};
