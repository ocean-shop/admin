import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { Switch } from '@ui/switch/switch';
import {
  SHOP_FEATURE_SWITCH_ID_PREFIX,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import { ShopFeatureOption } from '../../models/shop-feature-option.model';

/** One storefront feature flag: icon, title, column code, description and its switch. */
@Component({
  selector: 'app-shop-feature-toggle',
  imports: [Switch],
  templateUrl: './shop-feature-toggle.html',
  styleUrl: './shop-feature-toggle.scss',
})
export class ShopFeatureToggle {
  public readonly option = input.required<ShopFeatureOption>();
  public readonly control = input.required<FieldTree<boolean>>();

  protected readonly switchId = computed(
    () => `${SHOP_FEATURE_SWITCH_ID_PREFIX}${this.option().key}`,
  );
  protected readonly isEnabled = computed(() => this.control()().value());
  protected readonly stateLabel = computed(() =>
    this.isEnabled() ? SHOP_SETTINGS_TEXTS.FEATURE_ON : SHOP_SETTINGS_TEXTS.FEATURE_OFF,
  );
}
