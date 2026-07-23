import { ProductStatus } from './product-status.enum';
import { ProductType } from './product-type.enum';

export type UpdateProductPayload = {
  type?: ProductType;
  name?: string;
  description?: string;
  status?: ProductStatus;
  available?: boolean;
  sku?: string;
  price?: number;
  oldPrice?: number;
};
