import { ShopColorToken } from './shop-color-token.type';

export type ShopColorOption = {
  token: ShopColorToken;
  /** Storefront CSS token name (`muted-light`). */
  name: string;
  /** How many times the storefront uses the token. */
  usageCount: number;
  description: string;
};
