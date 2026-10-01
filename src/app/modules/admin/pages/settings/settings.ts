import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@ui/button/button';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { SettingsForm } from './components/settings-form/settings-form';
import { SettingsService } from './services/settings.service';
import {
  SETTINGS_CACHE_DESCRIPTION,
  SETTINGS_CACHE_INVALIDATE_ICON,
  SETTINGS_CACHE_INVALIDATE_LABEL,
  SETTINGS_CACHE_INVALIDATED_SUCCESS_MESSAGE,
  SETTINGS_CACHE_TITLE,
} from './constants/settings.constants';

@Component({
  selector: 'app-settings',
  imports: [SettingsForm, Button],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly settingsService = inject(SettingsService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cacheTitle = SETTINGS_CACHE_TITLE;
  protected readonly cacheDescription = SETTINGS_CACHE_DESCRIPTION;
  protected readonly cacheInvalidateLabel = SETTINGS_CACHE_INVALIDATE_LABEL;
  protected readonly cacheInvalidateIcon = SETTINGS_CACHE_INVALIDATE_ICON;

  protected readonly isCacheInvalidating = signal(false);

  protected onInvalidateCache(): void {
    if (this.isCacheInvalidating()) {
      return;
    }

    this.isCacheInvalidating.set(true);
    this.settingsService
      .invalidateCache()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isCacheInvalidating.set(false);
          this.toasterService.success(SETTINGS_CACHE_INVALIDATED_SUCCESS_MESSAGE);
        },
        error: () => {
          this.isCacheInvalidating.set(false);
        },
      });
  }
}
