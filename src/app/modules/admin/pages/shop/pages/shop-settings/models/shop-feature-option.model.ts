import { ShopFeatureKey } from './shop-feature-key.type';

export type ShopFeatureOption = {
  key: ShopFeatureKey;
  /** Column name shown as a code chip (`use_ukrposhta`). */
  code: string;
  icon: string;
  title: string;
  description: string;
};
