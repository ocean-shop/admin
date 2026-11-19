import { ShopColorScheme } from './shop-color-scheme.model';
import { ShopFeatureFlags } from './shop-feature-flags.model';

/** Signal Forms model; `colors` holds the raw text the admin typed (may be invalid). */
export type ShopSettingsFormData = {
  features: ShopFeatureFlags;
  colors: ShopColorScheme;
};
