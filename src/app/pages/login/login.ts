import { Component, signal, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Dropdown } from '@ui/dropdown/dropdown';
import { LoginForm } from './components/login-form/login-form';
import { OtpForm } from './components/otp-form/otp-form';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import {
  LANGUAGE_OPTIONS,
  VIEW_STORAGE_KEY,
  OTP_EXPIRATION_KEY,
  IDENTITY_STORAGE_KEY,
} from './constants/login.constant';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { LoginView } from './models/login.enum';
import { LoginService } from './services/login.service';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [Dropdown, LoginForm, OtpForm],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login implements OnInit {
  private toasterService = inject(ToasterService);
  private localStorageService = inject(LocalStorageService);
  private loginService = inject(LoginService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  languageOptions = LANGUAGE_OPTIONS;
  LoginView = LoginView;

  isFocused = signal(false);
  selectedLanguage = signal<DropdownOption>(this.languageOptions[0]);
  currentView = signal<LoginView>(LoginView.Login);
  isLoading = signal(false);
  identity = signal<string>('');

  ngOnInit() {
    this.restoreView();
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
  }

  onLanguageSelected(option: any) {
    this.selectedLanguage.set(option.detail || option);
  }

  onSubmit(identity: string) {
    this.identity.set(identity);
    this.localStorageService.setItem(IDENTITY_STORAGE_KEY, identity);
    this.isLoading.set(true);
    this.loginService
      .requestOtp(identity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.handleOtpRequestSuccess(),
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  onOtpSubmit(code: string) {
    this.isLoading.set(true);
    this.loginService
      .verifyOtp(this.identity(), code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => this.handleOtpVerificationSuccess(response),
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private handleOtpRequestSuccess(): void {
    this.isLoading.set(false);
    this.toasterService.success('OTP Sent', 'Please check your email or phone for the OTP.');
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
    this.setView(LoginView.Otp);
  }

  private handleOtpVerificationSuccess(response: any): void {
    this.isLoading.set(false);
    if (response && response.accessToken) {
      this.authService.handleAuthSuccess(response.accessToken);
    }
    this.localStorageService.removeItem(VIEW_STORAGE_KEY);
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
    this.localStorageService.removeItem(IDENTITY_STORAGE_KEY);
    this.router.navigate(['/admin']);
  }

  onBackToLogin() {
    this.localStorageService.removeItem(IDENTITY_STORAGE_KEY);
    this.setView(LoginView.Login);
  }

  private setView(view: LoginView) {
    this.currentView.set(view);
    this.localStorageService.setItem(VIEW_STORAGE_KEY, view);
  }
}
