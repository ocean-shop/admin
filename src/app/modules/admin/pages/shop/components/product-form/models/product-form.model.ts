import { ProductStatus } from '../../../pages/products/models/product-status.enum';
import { ProductType } from '../../../pages/products/models/product-type.enum';

export type ProductFormModel = {
  name: string;
  type: ProductType;
  description: string;
  price: string;
  oldPrice: string;
  sku: string;
  status: ProductStatus;
  available: boolean;
};
