import { ProductVariationAttributeItemPayload } from './product-variation-attribute-item-payload.model';
import { ProductVariationImageItemPayload } from './product-variation-image-item-payload.model';

export type UpdateProductVariationPayload = {
  title?: string;
  name?: string;
  sku?: string;
  price?: number;
  oldPrice?: number | null;
  available?: boolean;
  isDefault?: boolean;
  attributes?: ProductVariationAttributeItemPayload[];
  images?: ProductVariationImageItemPayload[];
};
