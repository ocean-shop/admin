import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Dropdown } from '@ui/dropdown/dropdown';
import { Button } from '@ui/button/button';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { AuthService } from '@core/services/auth/auth.service';
import { SettingsData, SettingsUpdateData } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';
import { DEFAULT_LANGUAGE, SETTINGS_LANGUAGE_OPTIONS } from '../../constants/settings.constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentSpinner } from '@ui/content-spinner/content-spinner';

@Component({
  selector: 'app-settings-form',
  imports: [Dropdown, Button, FormField, ContentSpinner],
  templateUrl: './settings-form.html',
  styleUrl: './settings-form.scss',
  standalone: true,
})
export class SettingsForm implements OnInit {
  private readonly toasterService = inject(ToasterService);
  private readonly authService = inject(AuthService);
  private readonly settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

  protected readonly languageOptions = SETTINGS_LANGUAGE_OPTIONS;
  protected readonly isLoading = signal(true);

  private readonly settingsModel = signal<SettingsData>({
    language: DEFAULT_LANGUAGE,
  });
  private readonly userId = signal<string | null>('');

  protected readonly settingsForm = form(this.settingsModel, (schemaPath) => {
    required(schemaPath.language, { message: 'Language is required' });
  });

  protected readonly isFormValid = computed(() => this.settingsForm.language().valid());

  ngOnInit(): void {
    this.userId.set(this.authService.getUserId());
    this.loadUserSettings();
  }

  protected onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const payload: SettingsUpdateData = {
      language: this.settingsForm.language().value()!,
      userId: this.userId(),
    };
    this.settingsService
      .setUserSettings(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (settings) => {
          this.applyLanguage(settings?.language);
          this.toasterService.success('Language changed');
        },
      });
  }

  private loadUserSettings(): void {
    this.settingsService
      .getUserSettings(this.userId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (settings) => {
          this.applyLanguage(settings?.language);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private applyLanguage(language: string | null | undefined): void {
    const isValidLanguage = this.languageOptions.some((option) => option.value === language);

    if (language && isValidLanguage) {
      this.settingsModel.update((model) => ({ ...model, language }));
    }
  }
}
