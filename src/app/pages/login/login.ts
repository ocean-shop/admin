import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dropdown } from '@ui/dropdown/dropdown';
import { LoginForm } from './components/login-form/login-form';
import { OtpForm } from './components/otp-form/otp-form';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { LANGUAGE_OPTIONS, VIEW_STORAGE_KEY, OTP_EXPIRATION_KEY } from './constants/login.constant';
import { ToasterService } from '@ui/toaster/toaster.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { LoginView } from './models/login.enum';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-login',
  imports: [Dropdown, LoginForm, OtpForm],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private toasterService = inject(ToasterService);
  private localStorageService = inject(LocalStorageService);
  private loginService = inject(LoginService);
  private router = inject(Router);

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
  }

  onLanguageSelected(option: any) {
    this.selectedLanguage.set(option.detail || option);
  }

  onSubmit(identity: string) {
    this.identity.set(identity);
    this.isLoading.set(true);
    this.loginService.requestOtp(identity).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toasterService.success('OTP Sent', 'Please check your email or phone for the OTP.');
        this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
        this.setView(LoginView.Otp);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onOtpSubmit(code: string) {
    this.isLoading.set(true);
    this.loginService.verifyOtp(this.identity(), code).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toasterService.success('Success', 'OTP verified successfully.');
        this.localStorageService.removeItem(VIEW_STORAGE_KEY);
        this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onBackToLogin() {
    this.setView(LoginView.Login);
  }

  private setView(view: LoginView) {
    this.currentView.set(view);
    this.localStorageService.setItem(VIEW_STORAGE_KEY, view);
  }
}
