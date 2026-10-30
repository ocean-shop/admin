import { ProductStatus } from '../pages/products/models/product-status.enum';
import { ProductType } from '../pages/products/models/product-type.enum';

export type ProductFormValues = {
  name: string | null | undefined;
  type: ProductType | null | undefined;
  description: string | null | undefined;
  sku: string | null | undefined;
  status: ProductStatus | null | undefined;
  available: boolean | null | undefined;
  isPopular: boolean | null | undefined;
  isMainBanner: boolean | null | undefined;
  price: string | null | undefined;
  oldPrice: string | null | undefined;
  slug: string | null | undefined;
  metaTitle: string | null | undefined;
  metaDescription: string | null | undefined;
  canonicalUrl: string | null | undefined;
  noIndex: boolean | null | undefined;
};
