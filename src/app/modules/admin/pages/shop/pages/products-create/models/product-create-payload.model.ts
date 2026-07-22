import { ProductStatus } from '../../products/models/product-status.enum';
import { ProductType } from '../../products/models/product-type.enum';

export type CreateProductPayload = {
  shopId: string;
  type?: ProductType;
  name: string;
  description?: string;
  status?: ProductStatus;
  available?: boolean;
  sku?: string;
  price?: number;
  oldPrice?: number;
};
