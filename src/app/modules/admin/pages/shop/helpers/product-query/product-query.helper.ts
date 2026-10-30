import { QueryClient } from '@tanstack/angular-query-experimental';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';

/** Refetches the product itself and, when the shop is known, every page of its product lists. */
export const invalidateProductQueries = (
  queryClient: QueryClient,
  productId: string,
  shopId: string | null,
): void => {
  void queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.productById(productId) });
  if (shopId) {
    void queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.productsScope(shopId) });
  }
};
