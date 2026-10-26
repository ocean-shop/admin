import { Component, signal, inject, OnInit, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { AuthService } from '@core/services/auth/auth.service';
import { AuthResponse } from '@core/models/auth.model';
import {
  IDENTITY_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
  VIEW_STORAGE_KEY,
} from '@core/constants/auth.constant';
import { LoginView } from './models/login.enum';
import { LoginService } from './services/login.service';
import { LoginForm } from './components/login-form/login-form';
import { OtpForm } from './components/otp-form/otp-form';
import {
  LOGIN_OTP_LIFETIME_MS,
  LOGIN_TEXTS,
  LOGIN_THROTTLE_COOLDOWN_MS,
} from './constants/login.constants';

@Component({
  selector: 'app-login',
  imports: [LoginForm, OtpForm],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly toasterService = inject(ToasterService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly loginService = inject(LoginService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly LoginView = LoginView;
  protected readonly pageTexts = LOGIN_TEXTS.PAGE;

  protected readonly isFocused = signal(false);
  protected readonly currentView = signal<LoginView>(LoginView.Login);
  protected readonly isLoading = signal(false);
  /** Set after the API answers 429, so the forms stay disabled for a while. */
  protected readonly isThrottled = signal(false);
  protected readonly isBusy = computed(() => this.isLoading() || this.isThrottled());
  protected readonly identity = signal<string>('');
  protected readonly otpExpiresAt = signal(0);

  public ngOnInit(): void {
    this.restoreView();
  }

  protected onSubmit(identity: string): void {
    this.identity.set(identity);
    this.localStorageService.setItem(IDENTITY_STORAGE_KEY, identity);
    this.requestOtp();
  }

  protected onResend(): void {
    this.requestOtp();
  }

  protected onOtpSubmit(code: string): void {
    this.isLoading.set(true);
    this.loginService
      .verifyOtp(this.identity(), code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.handleOtpVerificationSuccess(response),
        error: (error: HttpErrorResponse) => this.handleRequestError(error),
      });
  }

  protected onBackToLogin(): void {
    this.localStorageService.removeItem(IDENTITY_STORAGE_KEY);
    this.setView(LoginView.Login);
  }

  private restoreView(): void {
    const savedView = this.localStorageService.getItem<LoginView>(VIEW_STORAGE_KEY);
    if (savedView && Object.values(LoginView).includes(savedView)) {
      this.currentView.set(savedView);
    }
    const savedIdentity = this.localStorageService.getItem<string>(IDENTITY_STORAGE_KEY);
    if (savedIdentity) {
      this.identity.set(savedIdentity);
    }
    const savedExpiration = this.localStorageService.getItem<number>(OTP_EXPIRATION_KEY);
    if (savedExpiration) {
      this.otpExpiresAt.set(savedExpiration);
    }
  }

  private requestOtp(): void {
    this.isLoading.set(true);
    this.loginService
      .requestOtp(this.identity())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.handleOtpRequestSuccess(),
        error: (error: HttpErrorResponse) => this.handleRequestError(error),
      });
  }

  private handleOtpRequestSuccess(): void {
    this.isLoading.set(false);
    this.toasterService.success(
      LOGIN_TEXTS.TOASTER.OTP_SENT_TITLE,
      LOGIN_TEXTS.TOASTER.OTP_SENT_DESCRIPTION,
    );
    const expiresAt = Date.now() + LOGIN_OTP_LIFETIME_MS;
    this.otpExpiresAt.set(expiresAt);
    this.localStorageService.setItem(OTP_EXPIRATION_KEY, expiresAt);
    this.setView(LoginView.Otp);
  }

  private handleOtpVerificationSuccess(response: AuthResponse): void {
    this.isLoading.set(false);
    this.authService.handleAuthSuccess(response);
    this.localStorageService.removeItem(VIEW_STORAGE_KEY);
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
    this.localStorageService.removeItem(IDENTITY_STORAGE_KEY);
    this.router.navigate(['/admin']);
  }

  /** The toast comes from `errorInterceptor`; here only the form state is updated. */
  private handleRequestError(error: HttpErrorResponse): void {
    this.isLoading.set(false);
    if (error?.status === HttpStatusCode.TooManyRequests) {
      this.startThrottleCooldown();
    }
  }

  private startThrottleCooldown(): void {
    this.isThrottled.set(true);
    timer(LOGIN_THROTTLE_COOLDOWN_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.isThrottled.set(false));
  }

  private setView(view: LoginView): void {
    this.currentView.set(view);
    this.localStorageService.setItem(VIEW_STORAGE_KEY, view);
  }
}
