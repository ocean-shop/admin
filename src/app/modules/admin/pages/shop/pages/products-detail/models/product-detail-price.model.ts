export type ProductDetailPrice = {
  /** Current price, or `від <min>` for a variable product with different variation prices. */
  current: string;
  /** Crossed-out price; `null` when there is no discount. */
  old: string | null;
};
