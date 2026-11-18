import { Component, computed, input } from '@angular/core';
import { SectionCard } from '@ui/section-card/section-card';
import { SHOP_SETTINGS_ICONS, SHOP_SETTINGS_TEXTS } from '../../constants/shop-settings.constants';
import {
  SHOP_STOREFRONT_PREVIEW_ICONS,
  SHOP_STOREFRONT_PREVIEW_TEXTS,
} from '../../constants/shop-storefront-preview.constants';
import { buildPreviewCssVars } from '../../helpers/shop-color-view/shop-color-view.helper';
import { ShopColorScheme } from '../../models/shop-color-scheme.model';

/** Mini storefront painted with the palette being edited. */
@Component({
  selector: 'app-shop-storefront-preview',
  imports: [SectionCard],
  templateUrl: './shop-storefront-preview.html',
  styleUrl: './shop-storefront-preview.scss',
})
export class ShopStorefrontPreview {
  public readonly palette = input.required<ShopColorScheme>();

  protected readonly textData = SHOP_SETTINGS_TEXTS;
  protected readonly previewTexts = SHOP_STOREFRONT_PREVIEW_TEXTS;
  protected readonly previewIcons = SHOP_STOREFRONT_PREVIEW_ICONS;
  protected readonly cardIcon = SHOP_SETTINGS_ICONS.PREVIEW;
  protected readonly cssVars = computed(() => buildPreviewCssVars(this.palette()));
}
