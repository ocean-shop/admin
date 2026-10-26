import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_URL } from '@core/constants/api.constant';
import { AuthService } from '@core/services/auth/auth.service';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { authInterceptor } from './auth.interceptor';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { buildAuthSession } from '@testing/auth-session.fixture';
import { HTTP_ERROR_TEXTS } from '../constants/http-error.constants';
import { errorInterceptor } from './error.interceptor';

class ToasterServiceStub {
  danger = vi.fn();
}

@Component({
  standalone: true,
  template: '',
})
class DummyPageComponent {}

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;
  let toasterService: ToasterServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        ...provideTestQueryClient(),
        provideRouter([
          { path: 'login', component: DummyPageComponent },
          { path: 'admin/not-permission', component: DummyPageComponent },
        ]),
        {
          provide: ToasterService,
          useClass: ToasterServiceStub,
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    toasterService = TestBed.inject(ToasterService) as unknown as ToasterServiceStub;
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('retries a protected request once and avoids a second refresh loop', () => {
    authService.handleAuthSuccess(buildAuthSession('expired-token'));
    const errorHandler = vi.fn();

    http.get(`${API_URL}/catalog/categories`).subscribe({
      error: errorHandler,
    });

    const initialReq = httpMock.expectOne(`${API_URL}/catalog/categories`);
    expect(initialReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
    initialReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${API_URL}/user/auth/refresh`);
    expect(refreshReq.request.withCredentials).toBe(true);
    refreshReq.flush(buildAuthSession('fresh-token'));

    const retriedReq = httpMock.expectOne(`${API_URL}/catalog/categories`);
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retriedReq.flush('Unauthorized again', { status: 401, statusText: 'Unauthorized' });

    httpMock.expectNone(`${API_URL}/user/auth/refresh`);
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });

  it('clears session and redirects when refresh response misses access token', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    authService.handleAuthSuccess(buildAuthSession('expired-token'));
    const errorHandler = vi.fn();

    http.get(`${API_URL}/catalog/categories`).subscribe({
      error: errorHandler,
    });

    const initialReq = httpMock.expectOne(`${API_URL}/catalog/categories`);
    initialReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${API_URL}/user/auth/refresh`);
    refreshReq.flush({});

    expect(authService.getAccessToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(toasterService.danger).not.toHaveBeenCalled();
  });

  it('shows a throttling toast with the API message on 429', () => {
    http.post(`${API_URL}/user/auth/admin/request-otp`, {}).subscribe({ error: () => undefined });

    httpMock
      .expectOne(`${API_URL}/user/auth/admin/request-otp`)
      .flush({ message: 'Забагато запитів' }, { status: 429, statusText: 'Too Many Requests' });

    expect(toasterService.danger).toHaveBeenCalledWith(
      HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_TITLE,
      'Забагато запитів',
    );
  });

  it('falls back to the default throttling message when 429 has no body message', () => {
    http.get(`${API_URL}/catalog/categories`).subscribe({ error: () => undefined });

    httpMock
      .expectOne(`${API_URL}/catalog/categories`)
      .flush(null, { status: 429, statusText: 'Too Many Requests' });

    expect(toasterService.danger).toHaveBeenCalledWith(
      HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_TITLE,
      HTTP_ERROR_TEXTS.TOO_MANY_REQUESTS_MESSAGE,
    );
  });

  it('shows status title and API message for other errors', () => {
    http.get(`${API_URL}/catalog/categories`).subscribe({ error: () => undefined });

    httpMock
      .expectOne(`${API_URL}/catalog/categories`)
      .flush({ message: 'Bad input' }, { status: 400, statusText: 'Bad Request' });

    expect(toasterService.danger).toHaveBeenCalledWith('Error 400', 'Bad input');
  });
});
