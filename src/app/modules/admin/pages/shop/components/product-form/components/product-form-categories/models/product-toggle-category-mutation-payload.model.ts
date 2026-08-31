import { ToggleProductCategoryPayload } from '../../../../../pages/products/models/toggle-product-category-payload.model';

export type ProductToggleCategoryMutationPayload = {
  productId: string;
} & ToggleProductCategoryPayload;
