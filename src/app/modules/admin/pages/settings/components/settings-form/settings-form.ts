import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Button } from '@ui/button/button';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import { SettingsData } from '../../models/settings.model';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SETTINGS_LANGUAGE_OPTIONS,
} from '../../constants/settings.constants';

@Component({
  selector: 'app-settings-form',
  imports: [Dropdown, Button],
  templateUrl: './settings-form.html',
  styleUrl: './settings-form.scss',
})
export class SettingsForm implements OnInit {
  private readonly toasterService = inject(ToasterService);
  private readonly localStorageService = inject(LocalStorageService);

  protected readonly languageOptions = SETTINGS_LANGUAGE_OPTIONS;

  private readonly settingsModel = signal<SettingsData>({
    language: DEFAULT_LANGUAGE,
  });

  private readonly settingsForm = form(this.settingsModel, (schemaPath) => {
    required(schemaPath.language, { message: 'Language is required' });
  });

  protected readonly selectedLanguage = computed(() => {
    const currentValue = this.settingsForm.language().value();
    return (
      this.languageOptions.find((option) => option.value === currentValue) ??
      this.languageOptions[0]
    );
  });

  protected readonly isFormValid = computed(() => this.settingsForm.language().valid());

  ngOnInit(): void {
    this.restoreSavedLanguage();
  }

  protected onLanguageSelected(option: DropdownOption): void {
    this.settingsModel.update((model) => ({ ...model, language: option.value }));
  }

  protected onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const language = this.settingsForm.language().value()!;
    this.localStorageService.setItem(LANGUAGE_STORAGE_KEY, language);
    this.toasterService.success('Settings saved', 'Your language preference has been updated.');
  }

  private restoreSavedLanguage(): void {
    const savedLanguage = this.localStorageService.getItem<string>(LANGUAGE_STORAGE_KEY);
    const isValidLanguage = this.languageOptions.some((option) => option.value === savedLanguage);

    if (savedLanguage && isValidLanguage) {
      this.settingsModel.update((model) => ({ ...model, language: savedLanguage }));
    }
  }
}
