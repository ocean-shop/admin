import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ACCESS_TOKEN_KEY,
  AUTH_STORAGE_KEYS,
  SESSION_HINT_KEY,
} from '../../constants/auth.constant';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const API_URL = 'https://api-production-1765.up.railway.app';
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageService: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorageService = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear access token and all auth storage keys on clearSession', () => {
    service.setAccessToken('test-token');
    for (const key of AUTH_STORAGE_KEYS) {
      localStorageService.setItem(key, 'value');
    }

    service.clearSession();

    expect(service.getAccessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    for (const key of AUTH_STORAGE_KEYS) {
      expect(localStorageService.getItem(key)).toBeNull();
    }
  });

  it('should clear session and POST to logout endpoint with credentials', () => {
    const removeItemSpy = vi.spyOn(localStorageService, 'removeItem');
    service.setAccessToken('test-token');

    service.logout();

    expect(service.getAccessToken()).toBeNull();
    expect(removeItemSpy).toHaveBeenCalledTimes(AUTH_STORAGE_KEYS.length);
    for (const key of AUTH_STORAGE_KEYS) {
      expect(removeItemSpy).toHaveBeenCalledWith(key);
    }

    const req = httpMock.expectOne(`${API_URL}/user/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should not throw when logout API call fails', () => {
    service.setAccessToken('test-token');

    expect(() => {
      service.logout();
      const req = httpMock.expectOne(`${API_URL}/user/auth/logout`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    }).not.toThrow();

    expect(service.getAccessToken()).toBeNull();
  });

  it('returns user id from sub, userId, id claims and handles invalid token', () => {
    service.setAccessToken('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEifQ.sig');
    expect(service.getUserId()).toBe('user-1');

    service.setAccessToken('eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyLTIifQ.sig');
    expect(service.getUserId()).toBe('user-2');

    service.setAccessToken('eyJhbGciOiJIUzI1NiJ9.eyJpZCI6InVzZXItMyJ9.sig');
    expect(service.getUserId()).toBe('user-3');

    service.setAccessToken('not-a-jwt');
    expect(service.getUserId()).toBeNull();
  });

  it('returns null user id when no access token is set', () => {
    expect(service.getUserId()).toBeNull();
  });

  it('stores session hint on auth success and reads it back', () => {
    service.handleAuthSuccess('token-value');

    expect(service.getAccessToken()).toBe('token-value');
    expect(localStorageService.getItem(ACCESS_TOKEN_KEY)).toBe('token-value');
    expect(localStorageService.getItem(SESSION_HINT_KEY)).toBe(true);
    expect(service.hasSessionHint()).toBe(true);
  });

  it('reuses in-flight refresh request and updates access token on success', () => {
    let firstResult: unknown;
    let secondResult: unknown;

    service.refreshToken().subscribe((result) => {
      firstResult = result;
    });
    service.refreshToken().subscribe((result) => {
      secondResult = result;
    });

    const req = httpMock.expectOne(`${API_URL}/user/auth/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ accessToken: 'refreshed-token' });

    expect(firstResult).toEqual({ accessToken: 'refreshed-token' });
    expect(secondResult).toEqual({ accessToken: 'refreshed-token' });
    expect(service.getAccessToken()).toBe('refreshed-token');
    expect(service.hasSessionHint()).toBe(true);
  });

  it('clears refresh in-flight state after a failed refresh', () => {
    service.refreshToken().subscribe({
      error: () => {
        // Expected error path for this test.
      },
    });

    const firstReq = httpMock.expectOne(`${API_URL}/user/auth/refresh`);
    firstReq.flush('failure', { status: 500, statusText: 'Server Error' });

    service.refreshToken().subscribe();
    const secondReq = httpMock.expectOne(`${API_URL}/user/auth/refresh`);
    secondReq.flush({ accessToken: 'new-token' });

    expect(service.getAccessToken()).toBe('new-token');
  });
});
