import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
  const API_URL = 'https://api-production-1765.up.railway.app';
  let service: LoginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests OTP with email payload when identity is an email', () => {
    service.requestOtp('admin@ocean.dev').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/auth/admin/request-otp`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ email: 'admin@ocean.dev' });
    req.flush({});
  });

  it('requests OTP with phone payload when identity is not an email', () => {
    service.requestOtp('+1555000111').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/auth/admin/request-otp`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ phone: '+1555000111' });
    req.flush({});
  });

  it('verifies OTP with email payload when identity is an email', () => {
    service.verifyOtp('admin@ocean.dev', '123456').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/auth/verify-otp`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ email: 'admin@ocean.dev', code: '123456' });
    req.flush({});
  });

  it('verifies OTP with phone payload when identity is not an email', () => {
    service.verifyOtp('+1555000111', '123456').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/auth/verify-otp`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ phone: '+1555000111', code: '123456' });
    req.flush({});
  });
});
