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
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    hasSessionHint: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
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

  it('allows access when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    expect(runGuard()).toBe(true);
    expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
  });

  it('redirects to login when there is no session hint', () => {
    const result = runGuard() as UrlTree;

    expect(serializeUrl(result)).toBe('/login');
  });

  it('allows access after successful token refresh', async () => {
    mockAuthService.hasSessionHint.mockReturnValue(true);
    mockAuthService.refreshToken.mockReturnValue(of({ accessToken: 'token' }));

    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);

    expect(result).toBe(true);
    expect(mockAuthService.clearSession).not.toHaveBeenCalled();
  });

  it('clears session and redirects to login when refresh fails', async () => {
    mockAuthService.hasSessionHint.mockReturnValue(true);
    mockAuthService.refreshToken.mockReturnValue(throwError(() => new Error('expired')));

    const result = await firstValueFrom(runGuard() as Observable<boolean | UrlTree>);

    expect(mockAuthService.clearSession).toHaveBeenCalled();
    expect(serializeUrl(result as UrlTree)).toBe('/login');
  });
});
