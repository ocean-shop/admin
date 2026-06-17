import { Component, signal, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Dropdown } from '@ui/dropdown/dropdown';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { LANGUAGE_OPTIONS } from './constants/login.constant';
import { ToasterService } from '@ui/toaster/toaster.service';

@Component({
  selector: 'app-login',
  imports: [Dropdown, Input, Button],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private toasterService = inject(ToasterService);

  isFocused = signal(false);

  languageOptions = LANGUAGE_OPTIONS;
  selectedLanguage = signal<DropdownOption>(this.languageOptions[0]);

  onLanguageSelected(option: any) {
    this.selectedLanguage.set(option.detail || option);
  }

  onSubmit() {
    this.toasterService.success('Login Attempt', 'Sign in process initiated successfully.');
  }
}
