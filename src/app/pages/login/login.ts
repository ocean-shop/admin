import { Component, HostListener, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Dropdown } from '../../../ui/dropdown/dropdown';
import { Input } from '../../../ui/input/input';
import { Button } from '../../../ui/button/button';

export interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-login',
  imports: [Dropdown, Input, Button],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isFocused = signal(false);

  languageOptions: DropdownOption[] = [
    { label: 'English', value: 'en' },
    { label: 'Українська', value: 'uk' },
    { label: 'Русский', value: 'ru' },
  ];
  selectedLanguage = signal<DropdownOption>(this.languageOptions[0]);

  onLanguageSelected(option: any) {
    this.selectedLanguage.set(option.detail || option);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    document.body.style.backgroundPosition = `${x * 10}px ${y * 10}px`;
  }
}
