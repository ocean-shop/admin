import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { AuthService } from '@core/services/auth/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds bearer token to regular API calls', () => {
    authService.setAccessToken('token-123');

    http.get(`${API_URL}/catalog/categories`).subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/categories`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush([]);
  });

  it('skips bearer token for refresh and logout endpoints', () => {
    authService.setAccessToken('token-123');

    http.post(`${API_URL}/user/auth/refresh`, {}).subscribe();
    const refreshReq = httpMock.expectOne(`${API_URL}/user/auth/refresh`);
    expect(refreshReq.request.headers.has('Authorization')).toBe(false);
    refreshReq.flush({ accessToken: 'next-token' });

    http.post(`${API_URL}/user/auth/logout`, {}).subscribe();
    const logoutReq = httpMock.expectOne(`${API_URL}/user/auth/logout`);
    expect(logoutReq.request.headers.has('Authorization')).toBe(false);
    logoutReq.flush({});
  });
});
