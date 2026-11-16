/** Related product row / search result of the editor's related products section. */
export type ProductFormRelatedProduct = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  /** Label of a status the storefront hides (draft, archived); `null` for active products. */
  hiddenStatusLabel: string | null;
};
