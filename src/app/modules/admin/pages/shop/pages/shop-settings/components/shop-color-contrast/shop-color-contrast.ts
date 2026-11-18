import { Component, computed, input } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { SectionCard } from '@ui/section-card/section-card';
import { SHOP_SETTINGS_ICONS, SHOP_SETTINGS_TEXTS } from '../../constants/shop-settings.constants';
import { buildContrastRows } from '../../helpers/shop-color-view/shop-color-view.helper';
import { ShopColorScheme } from '../../models/shop-color-scheme.model';

/** WCAG contrast of the key text/background pairs of the edited palette. */
@Component({
  selector: 'app-shop-color-contrast',
  imports: [SectionCard, Badge],
  templateUrl: './shop-color-contrast.html',
  styleUrl: './shop-color-contrast.scss',
})
export class ShopColorContrast {
  public readonly palette = input.required<ShopColorScheme>();

  protected readonly textData = SHOP_SETTINGS_TEXTS;
  protected readonly cardIcon = SHOP_SETTINGS_ICONS.CONTRAST;
  protected readonly rows = computed(() => buildContrastRows(this.palette()));
}
