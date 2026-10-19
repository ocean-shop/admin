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
  isMainBanner?: boolean;
  sku?: string;
  price?: number;
  oldPrice?: number;
  slug?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};
