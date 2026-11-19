import { ShopColorToken } from './shop-color-token.type';

/** A palette token or a fixed hex color (`#ffffff` text on the accent button). */
export type ShopContrastColor = ShopColorToken | `#${string}`;
