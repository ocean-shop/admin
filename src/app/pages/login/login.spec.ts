import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { buildAuthSession } from '@testing/auth-session.fixture';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { AuthService } from '@core/services/auth/auth.service';
import {
  IDENTITY_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
  VIEW_STORAGE_KEY,
} from '@core/constants/auth.constant';
import { Login } from './login';
import { LoginService } from './services/login.service';
import { LoginView } from './models/login.enum';
import {
  LOGIN_OTP_LIFETIME_MS,
  LOGIN_TEXTS,
  LOGIN_THROTTLE_COOLDOWN_MS,
} from './constants/login.constants';

describe('Login', () => {
  let component: any;
  let fixture: ComponentFixture<Login>;
  let mockLocalStorageService: any;
  let mockToasterService: any;
  let mockLoginService: any;
  let mockAuthService: any;
  let mockRouter: any;

  const throttled = (): HttpErrorResponse =>
    new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' });

  beforeEach(async () => {
    mockLocalStorageService = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    mockToasterService = { success: vi.fn() };
    mockLoginService = {
      requestOtp: vi.fn().mockReturnValue(of({ message: 'ok' })),
      verifyOtp: vi.fn().mockReturnValue(of(buildAuthSession())),
    };
    mockAuthService = { handleAuthSuccess: vi.fn() };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('restores view, identity and OTP expiration from local storage on init', () => {
    const stored: Record<string, unknown> = {
      [VIEW_STORAGE_KEY]: LoginView.Otp,
      [IDENTITY_STORAGE_KEY]: 'admin@ocean.dev',
      [OTP_EXPIRATION_KEY]: 123456,
    };
    mockLocalStorageService.getItem.mockImplementation((key: string) => stored[key] ?? null);

    component.ngOnInit();

    expect(component.currentView()).toBe(LoginView.Otp);
    expect(component.identity()).toBe('admin@ocean.dev');
    expect(component.otpExpiresAt()).toBe(123456);
  });

  it('ignores an unknown stored view and missing values', () => {
    mockLocalStorageService.getItem.mockImplementation((key: string) =>
      key === VIEW_STORAGE_KEY ? 'unknown' : null,
    );

    component.ngOnInit();

    expect(component.currentView()).toBe(LoginView.Login);
    expect(component.identity()).toBe('');
    expect(component.otpExpiresAt()).toBe(0);
  });

  it('requests OTP on submit, stores expiration and switches to OTP view', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);

    component.onSubmit('test@example.com');

    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(
      IDENTITY_STORAGE_KEY,
      'test@example.com',
    );
    expect(mockLoginService.requestOtp).toHaveBeenCalledWith('test@example.com');
    expect(mockToasterService.success).toHaveBeenCalledWith(
      LOGIN_TEXTS.TOASTER.OTP_SENT_TITLE,
      LOGIN_TEXTS.TOASTER.OTP_SENT_DESCRIPTION,
    );
    const expiresAt = 1_000_000 + LOGIN_OTP_LIFETIME_MS;
    expect(component.otpExpiresAt()).toBe(expiresAt);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(OTP_EXPIRATION_KEY, expiresAt);
    expect(component.currentView()).toBe(LoginView.Otp);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY, LoginView.Otp);
    expect(component.isLoading()).toBe(false);
  });

  it('resends OTP for the current identity and restarts the timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(2_000_000);
    component.identity.set('0991234567');

    component.onResend();

    expect(mockLoginService.requestOtp).toHaveBeenCalledWith('0991234567');
    expect(component.otpExpiresAt()).toBe(2_000_000 + LOGIN_OTP_LIFETIME_MS);
    expect(mockToasterService.success).toHaveBeenCalled();
  });

  it('stops loading without switching view when OTP request fails', () => {
    mockLoginService.requestOtp.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400 })),
    );

    component.onSubmit('test@example.com');

    expect(component.isLoading()).toBe(false);
    expect(component.isThrottled()).toBe(false);
    expect(component.currentView()).toBe(LoginView.Login);
  });

  it('disables the forms for a cooldown after 429', () => {
    vi.useFakeTimers();
    mockLoginService.requestOtp.mockReturnValue(throwError(throttled));

    component.onSubmit('test@example.com');

    expect(component.isThrottled()).toBe(true);
    expect(component.isBusy()).toBe(true);

    vi.advanceTimersByTime(LOGIN_THROTTLE_COOLDOWN_MS);

    expect(component.isThrottled()).toBe(false);
    expect(component.isBusy()).toBe(false);
  });

  it('verifies OTP, hands the session to AuthService and navigates to admin', () => {
    const session = buildAuthSession('fake-token');
    mockLoginService.verifyOtp.mockReturnValue(of(session));
    component.identity.set('test@example.com');

    component.onOtpSubmit('1234');

    expect(mockLoginService.verifyOtp).toHaveBeenCalledWith('test@example.com', '1234');
    expect(mockAuthService.handleAuthSuccess).toHaveBeenCalledWith(session);
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY);
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(OTP_EXPIRATION_KEY);
    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(IDENTITY_STORAGE_KEY);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('throttles after a 429 from OTP verification', () => {
    mockLoginService.verifyOtp.mockReturnValue(throwError(throttled));

    component.onOtpSubmit('1234');

    expect(mockAuthService.handleAuthSuccess).not.toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(component.isThrottled()).toBe(true);
  });

  it('returns to login view and forgets identity', () => {
    component.onBackToLogin();

    expect(mockLocalStorageService.removeItem).toHaveBeenCalledWith(IDENTITY_STORAGE_KEY);
    expect(component.currentView()).toBe(LoginView.Login);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(VIEW_STORAGE_KEY, LoginView.Login);
  });

  it('renders the OTP form with busy state and expiration', async () => {
    component.currentView.set(LoginView.Otp);
    component.otpExpiresAt.set(42);
    component.isThrottled.set(true);
    await fixture.whenStable();

    const otpForm = fixture.debugElement.query((el) => el.name === 'app-otp-form');
    expect(otpForm.componentInstance.expiresAt()).toBe(42);
    expect(otpForm.componentInstance.isLoading()).toBe(true);
  });
});
