import { QueryClient } from '@tanstack/angular-query-experimental';
import { SHOP_QUERY_KEYS } from '../constants/shop-query-keys.constants';
import { invalidateProductQueries } from './product-query.helper';

describe('product-query.helper', () => {
  let queryClient: QueryClient;
  let invalidateQueries: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    queryClient = new QueryClient();
    invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
  });

  it('invalidates the product and the product lists of the shop', () => {
    invalidateProductQueries(queryClient, 'product-1', 'shop-1');

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: SHOP_QUERY_KEYS.productById('product-1'),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: SHOP_QUERY_KEYS.productsScope('shop-1'),
    });
  });

  it('invalidates only the product without a shop', () => {
    invalidateProductQueries(queryClient, 'product-1', null);

    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });
});
