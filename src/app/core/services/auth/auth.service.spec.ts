import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_STORAGE_KEYS } from '../../constants/auth.constant';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
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

    const req = httpMock.expectOne('http://localhost:3000/user/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should not throw when logout API call fails', () => {
    service.setAccessToken('test-token');

    expect(() => {
      service.logout();
      const req = httpMock.expectOne('http://localhost:3000/user/auth/logout');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    }).not.toThrow();

    expect(service.getAccessToken()).toBeNull();
  });
});
