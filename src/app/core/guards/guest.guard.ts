import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/admin']);
  }

  if (authService.hasSessionHint()) {
    return authService.refreshToken().pipe(
      map(() => router.createUrlTree(['/admin'])),
      catchError(() => {
        authService.clearSession();
        return of(true);
      }),
    );
  }

  return true;
};
