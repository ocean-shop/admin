import { ShopColorToken } from './shop-color-token.type';

/** The full palette the storefront renders. */
export type ShopColorScheme = Record<ShopColorToken, string>;

/** A hex sets the token, `null` resets it to the default, a missing key leaves it unchanged. */
export type ShopColorSchemePatch = Partial<Record<ShopColorToken, string | null>>;
