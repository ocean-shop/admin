import { ShopColorScheme, ShopColorSchemePatch } from './shop-color-scheme.model';
import { ShopFeatureFlags } from './shop-feature-flags.model';

/** `GET/PATCH /settings/shops/:shopId` response; `colorScheme` is the merged palette. */
export type ShopSettingsApiResponse = Partial<Record<keyof ShopFeatureFlags, boolean | null>> & {
  shopId?: string | null;
  colorScheme?: Partial<ShopColorScheme> | null;
  updatedAt?: string | null;
};

/** Partial update: only the sent fields change. */
export type ShopSettingsUpdatePayload = Partial<ShopFeatureFlags> & {
  colorScheme?: ShopColorSchemePatch;
};
