import { ToggleProductAttributePayload } from '../../../../../pages/products/models/toggle-product-attribute-payload.model';

export type ProductToggleAttributeMutationPayload = {
  productId: string;
} & ToggleProductAttributePayload;
