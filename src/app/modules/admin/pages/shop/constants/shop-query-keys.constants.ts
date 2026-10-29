import { ProductSortValue } from '../pages/products/models/product-sort-value.type';
import { UserSortValue } from '../pages/users/models/user-sort-value.type';
import { OrderSortValue } from '../pages/orders/models/order-sort-value.type';

/** Placeholder key segment for disabled queries that are waiting for a route param. */
export const SHOP_QUERY_MISSING_ID = 'missing-id';

/** `*Scope` keys are prefixes of the list keys and are used to invalidate every page at once. */
export const SHOP_QUERY_KEYS = {
  productsScope: (shopId: string) => ['shop', shopId, 'products'] as const,
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
  categoryById: (categoryId: string) => ['shop', 'categories', 'detail', categoryId] as const,
  attributesScope: (shopId: string) => ['shop', shopId, 'attributes'] as const,
  attributes: (shopId: string, page: number, limit: number, name: string) =>
    ['shop', shopId, 'attributes', page, limit, name] as const,
  attributesSearch: (shopId: string, name: string) =>
    ['shop', shopId, 'attributes', 'search', name] as const,
  tagsScope: (shopId: string) => ['shop', shopId, 'tags'] as const,
  tags: (shopId: string, page: number, limit: number, name: string) =>
    ['shop', shopId, 'tags', page, limit, name] as const,
  tagsSearch: (shopId: string, name: string) => ['shop', shopId, 'tags', 'search', name] as const,
  ordersScope: (shopId: string) => ['shop', shopId, 'orders'] as const,
  orders: (
    shopId: string,
    page: number,
    limit: number,
    sort: OrderSortValue,
    orderNumber: string,
  ) => ['shop', shopId, 'orders', page, limit, sort, orderNumber] as const,
  orderById: (orderId: string) => ['shop', 'orders', orderId] as const,
  users: (
    shopId: string,
    page: number,
    limit: number,
    sort: UserSortValue,
    email: string,
    phoneNumber: string,
  ) => ['shop', shopId, 'users', page, limit, sort, email, phoneNumber] as const,
  userById: (userId: string) => ['shop', 'users', userId] as const,
  statistic: (shopId: string) => ['shop', shopId, 'statistic'] as const,
  /** Key for a query that stays disabled until its id is known. */
  disabled: (scope: string) => ['shop', scope, SHOP_QUERY_MISSING_ID] as const,
};
