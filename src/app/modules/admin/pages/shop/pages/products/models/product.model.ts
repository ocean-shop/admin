import { ProductStatus } from './product-status.enum';
import { ProductType } from './product-type.enum';

export interface ProductCategoryApiItem {
  id?: string | null;
  name?: string | null;
}

export interface ProductApiItem {
  id?: string | null;
  shopId?: string | null;
  title?: string | null;
  name?: string | null;
  sku?: string | null;
  type?: ProductType | string | null;
  status?: ProductStatus | string | null;
  price?: number | string | null;
  categories?: (ProductCategoryApiItem | string)[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductListResponse {
  items: ProductApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductListQueryParams {
  page: number;
  limit: number;
  shopId: string;
  name?: string;
  sku?: string;
  categoryIds?: string[];
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface Product {
  id: string;
  shopId: string;
  title: string;
  sku: string;
  type: string;
  status: string;
  price: string;
  categories: string;
}
