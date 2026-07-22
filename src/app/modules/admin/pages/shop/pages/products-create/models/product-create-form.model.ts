import { ProductStatus } from '../../products/models/product-status.enum';
import { ProductType } from '../../products/models/product-type.enum';

export type ProductCreateFormModel = {
  name: string;
  type: ProductType;
  description: string;
  price: string;
  oldPrice: string;
  sku: string;
  status: ProductStatus;
  available: boolean;
};
