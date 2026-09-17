import { ProductStatus } from './product-status.enum';
import { ProductType } from './product-type.enum';

export type CreateProductPayload = {
  shopId: string;
  type?: ProductType;
  name: string;
  description?: string;
  status?: ProductStatus;
  available?: boolean;
  isPopular?: boolean;
  sku?: string;
  price?: number;
  oldPrice?: number;
};
