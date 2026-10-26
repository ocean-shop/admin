import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    hasSessionHint: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  const serializeUrl = (tree: UrlTree): string => TestBed.inject(Router).serializeUrl(tree);

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      hasSessionHint: vi.fn().mockReturnValue(false),
      refreshToken: vi.fn(),
      clearSession: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
  });

  it('redirects authenticated user to admin', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    expect(serializeUrl(runGuard() as UrlTree)).toBe('/admin');
  });

  it('allows guest without session hint', () => {
    expect(runGuard()).toBe(true);
    expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
  });

  it('redirects to admin after successful token refresh', async () => {
    mockAuthService.hasSessionHint.mockReturnValue(true);
    mockAuthService.refreshToken.mockReturnValue(of({ accessToken: 'token' }));

    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);

    expect(serializeUrl(result as UrlTree)).toBe('/admin');
  });

  it('clears session and allows access when refresh fails', async () => {
    mockAuthService.hasSessionHint.mockReturnValue(true);
    mockAuthService.refreshToken.mockReturnValue(throwError(() => new Error('expired')));

    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);

    expect(result).toBe(true);
    expect(mockAuthService.clearSession).toHaveBeenCalled();
  });
});
