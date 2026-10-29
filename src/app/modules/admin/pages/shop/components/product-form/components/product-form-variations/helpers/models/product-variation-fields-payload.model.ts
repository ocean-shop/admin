import { UpdateProductVariationPayload } from '../../../../../../pages/products/models/update-product-variation-payload.model';

/** Fields shared by the create and update variation payloads. */
export type ProductVariationFieldsPayload = Required<
  Pick<UpdateProductVariationPayload, 'attributes' | 'images'>
> &
  Pick<
    UpdateProductVariationPayload,
    'title' | 'name' | 'sku' | 'price' | 'oldPrice' | 'available' | 'isDefault'
  >;
