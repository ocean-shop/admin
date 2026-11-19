import { Component, computed, inject, linkedSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { ActionBar } from '@ui/action-bar/action-bar';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { SectionCard } from '@ui/section-card/section-card';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import { ShopColorContrast } from './components/shop-color-contrast/shop-color-contrast';
import { ShopColorRow } from './components/shop-color-row/shop-color-row';
import { ShopFeatureToggle } from './components/shop-feature-toggle/shop-feature-toggle';
import { ShopStorefrontPreview } from './components/shop-storefront-preview/shop-storefront-preview';
import {
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_FEATURE_OPTIONS,
  SHOP_SETTINGS_ICONS,
  SHOP_SETTINGS_STATUS_VIEWS,
  SHOP_SETTINGS_TEXTS,
} from './constants/shop-settings.constants';
import { buildColorGroupViews } from './helpers/shop-color-view/shop-color-view.helper';
import {
  applyShopSettingsValidators,
  buildShopSettingsPayload,
  isDefaultColorScheme,
  isShopSettingsDirty,
  mapShopSettingsToFormData,
  resolveEffectiveColors,
  resolveShopSettingsStatus,
} from './helpers/shop-settings-form/shop-settings-form.helper';
import { ShopSettingsSaveVariables } from './models/shop-settings-save-variables.model';
import { ShopSettingsService } from './services/shop-settings/shop-settings.service';

@Component({
  selector: 'app-shop-settings',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    SectionCard,
    Button,
    ActionBar,
    ShopFeatureToggle,
    ShopColorRow,
    ShopStorefrontPreview,
    ShopColorContrast,
  ],
  templateUrl: './shop-settings.html',
  styleUrl: './shop-settings.scss',
})
export class ShopSettings {
  private readonly shopSettingsService = inject(ShopSettingsService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = SHOP_SETTINGS_TEXTS;
  protected readonly icons = SHOP_SETTINGS_ICONS;
  protected readonly featureOptions = SHOP_FEATURE_OPTIONS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), SHOP_SETTINGS_TEXTS.PAGE_TITLE),
  );

  protected readonly settingsQuery = injectQuery(() => {
    const shopId = this.shopId();
    return {
      queryKey: shopId ? SHOP_QUERY_KEYS.settings(shopId) : SHOP_QUERY_KEYS.disabled('settings'),
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.shopSettingsService.getShopSettings(shopId ?? '')),
    };
  });

  protected readonly saveMutation = injectMutation(() => ({
    mutationFn: ({ shopId, payload }: ShopSettingsSaveVariables) =>
      lastValueFrom(this.shopSettingsService.updateShopSettings(shopId, payload)),
  }));

  /** Last saved state; the form resets to it whenever the server data changes. */
  private readonly savedData = computed(() => mapShopSettingsToFormData(this.settingsQuery.data()));
  private readonly formModel = linkedSignal(() => this.savedData());
  protected readonly settingsForm = form(this.formModel, applyShopSettingsValidators);

  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isLoading = computed(
    () => this.isShopContextReady() && this.settingsQuery.isPending(),
  );
  protected readonly hasError = computed(() => this.settingsQuery.isError());
  protected readonly isReady = computed(() => Boolean(this.settingsQuery.data()));
  protected readonly isSaving = computed(() => this.saveMutation.isPending());

  protected readonly effectiveColors = computed(() =>
    resolveEffectiveColors(this.formModel().colors, this.savedData().colors),
  );
  protected readonly colorGroups = computed(() =>
    buildColorGroupViews(this.formModel().colors, this.savedData().colors),
  );
  protected readonly isColorSchemeDefault = computed(() =>
    isDefaultColorScheme(this.formModel().colors),
  );
  protected readonly isDirty = computed(() =>
    isShopSettingsDirty(this.formModel(), this.savedData()),
  );
  protected readonly isInvalid = computed(() => this.settingsForm().invalid());
  protected readonly status = computed(
    () => SHOP_SETTINGS_STATUS_VIEWS[resolveShopSettingsStatus(this.isInvalid(), this.isDirty())],
  );
  protected readonly canSave = computed(
    () => this.isDirty() && !this.isInvalid() && !this.isSaving(),
  );

  protected onResetColors(): void {
    this.formModel.update((data) => ({ ...data, colors: { ...SHOP_DEFAULT_COLOR_SCHEME } }));
  }

  protected onDiscard(): void {
    this.formModel.set(this.savedData());
  }

  protected onSave(): void {
    const shopId = this.shopId();
    if (!shopId || !this.canSave()) {
      return;
    }

    const payload = buildShopSettingsPayload(this.formModel(), this.savedData());
    const queryKey = SHOP_QUERY_KEYS.settings(shopId);

    this.saveMutation.mutate(
      { shopId, payload },
      {
        onSuccess: (response) => {
          this.queryClient.setQueryData(queryKey, response);
          this.toasterService.success(SHOP_SETTINGS_TEXTS.SAVE_SUCCESS_TITLE);
          void this.queryClient.invalidateQueries({ queryKey });
        },
      },
    );
  }
}
