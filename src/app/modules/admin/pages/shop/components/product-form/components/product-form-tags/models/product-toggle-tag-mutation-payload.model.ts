import { ToggleProductTagPayload } from '../../../../../pages/products/models/toggle-product-tag-payload.model';

export type ProductToggleTagMutationPayload = {
  productId: string;
} & ToggleProductTagPayload;
