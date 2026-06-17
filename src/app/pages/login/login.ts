import { Component, signal, inject, OnInit } from '@angular/core';
import { Dropdown } from '@ui/dropdown/dropdown';
import { LoginForm } from './components/login-form/login-form';
import { OtpForm } from './components/otp-form/otp-form';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { LANGUAGE_OPTIONS, VIEW_STORAGE_KEY } from './constants/login.constant';
import { ToasterService } from '@ui/toaster/toaster.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { LoginView } from './models/login.enum';

@Component({
  selector: 'app-login',
  imports: [Dropdown, LoginForm, OtpForm],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private toasterService = inject(ToasterService);
  private localStorageService = inject(LocalStorageService);

  languageOptions = LANGUAGE_OPTIONS;
  LoginView = LoginView;

  isFocused = signal(false);
  selectedLanguage = signal<DropdownOption>(this.languageOptions[0]);
  currentView = signal<LoginView>(LoginView.Login);

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

  onSubmit() {
    this.toasterService.success('Login Attempt', 'Sign in process initiated successfully.');
    this.localStorageService.removeItem('otp_expiration_time');
    this.setView(LoginView.Otp);
  }

  onBackToLogin() {
    this.setView(LoginView.Login);
  }

  private setView(view: LoginView) {
    this.currentView.set(view);
    this.localStorageService.setItem(VIEW_STORAGE_KEY, view);
  }
}
