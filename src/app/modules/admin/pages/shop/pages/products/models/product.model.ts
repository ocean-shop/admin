import { ProductStatus } from './product-status.enum';
import { ProductType } from './product-type.enum';

export type ProductCategoryApiItem = {
  id?: string | null;
  name?: string | null;
};

export type ProductAttributeApiItem = {
  id?: string | null;
  attributeTypeId?: string | null;
  name?: string | null;
  value?: string | null;
  attributeType?: {
    id?: string | null;
    name?: string | null;
    value?: string | null;
  } | null;
};

export type ProductTagApiItem = {
  id?: string | null;
  tagId?: string | null;
  name?: string | null;
  tag?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export type ProductApiItem = {
  id?: string | null;
  shopId?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  sku?: string | null;
  type?: ProductType | string | null;
  status?: ProductStatus | string | null;
  available?: boolean | null;
  price?: number | string | null;
  oldPrice?: number | string | null;
  categories?: (ProductCategoryApiItem | string)[] | null;
  attributes?: (ProductAttributeApiItem | string)[] | null;
  attributeTypes?: (ProductAttributeApiItem | string)[] | null;
  tags?: (ProductTagApiItem | string)[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ProductListResponse = {
  items: ProductApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ProductListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  name?: string;
  sku?: string;
  categoryIds?: string[];
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
};

export type Product = {
  id: string;
  shopId: string;
  title: string;
  sku: string;
  type: string;
  status: string;
  price: string;
  categories: string;
};
