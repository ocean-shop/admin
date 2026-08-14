import { ProductSortValue } from '../pages/products/models/product-sort-value.type';

export const SHOP_QUERY_KEYS = {
  products: (
    shopId: string,
    page: number,
    limit: number,
    sort: ProductSortValue,
    name: string,
    sku: string,
    categoryIds: string[],
  ) => ['shop', shopId, 'products', page, limit, sort, name, sku, ...categoryIds] as const,
  productById: (productId: string) => ['shop', 'products', productId] as const,
  categories: (shopId: string) => ['shop', shopId, 'categories'] as const,
  attributes: (shopId: string, page: number, limit: number, name: string) =>
    ['shop', shopId, 'attributes', page, limit, name] as const,
  attributesSearch: (shopId: string, name: string) =>
    ['shop', shopId, 'attributes', 'search', name] as const,
  tags: (shopId: string, page: number, limit: number, name: string) =>
    ['shop', shopId, 'tags', page, limit, name] as const,
  tagsSearch: (shopId: string, name: string) => ['shop', shopId, 'tags', 'search', name] as const,
};
