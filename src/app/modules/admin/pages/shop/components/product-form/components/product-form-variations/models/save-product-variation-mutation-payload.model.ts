import { ProductFormVariation } from '../../../models/product-form-variation.model';

export type SaveProductVariationMutationPayload = {
  productId: string;
  variation: ProductFormVariation;
};
