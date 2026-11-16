import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOP_QUERY_KEYS } from '../../../../../../constants/shop-query-keys.constants';
import { ProductApiItem } from '../../../../../../pages/products/models/product.model';
import { ProductsService } from '../../../../../../pages/products/services/products/products.service';
import {
  PRODUCT_FORM_RELATED_PRODUCTS_MAX,
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_TOAST_TEXTS,
} from '../../../../constants/product-form.constants';
import { ProductFormSearchService } from '../../../../services/product-form-search/product-form-search.service';
import { ProductRelatedProductsService } from './product-related-products.service';

describe('ProductRelatedProductsService', () => {
  let service: ProductRelatedProductsService;
  let queryClient: QueryClient;
  let getRelatedProducts: ReturnType<typeof vi.fn>;
  let assignRelatedProducts: ReturnType<typeof vi.fn>;
  let searchProductsBySku: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;
  let sidebarEnabled: boolean;
  let shopId: string | null;

  const related: ProductApiItem[] = [
    { id: 'p2', name: 'Fins', sku: 'FN-1' },
    { id: 'p3', name: 'Mask', sku: 'MS-1' },
  ];

  const flush = async (): Promise<void> => {
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
    TestBed.tick();
  };

  const ids = (): string[] => service.items().map((item) => item.id);

  beforeEach(async () => {
    vi.useFakeTimers();
    sidebarEnabled = true;
    shopId = 'shop-1';
    // Fake "server" state: a save replaces it, a refetch reads it.
    let serverRelated: ProductApiItem[] = related;
    getRelatedProducts = vi.fn().mockImplementation(() => of(serverRelated));
    assignRelatedProducts = vi
      .fn()
      .mockImplementation((_productId: string, { productIds }: { productIds: string[] }) => {
        serverRelated = productIds.map((id) => ({ id, name: id }));
        return of(serverRelated);
      });
    searchProductsBySku = vi.fn().mockResolvedValue([
      { id: 'p1', name: 'Self' },
      { id: 'p2', name: 'Fins' },
      { id: 'p4', name: 'Snorkel', sku: 'SN-1' },
    ]);
    success = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductRelatedProductsService,
        { provide: ProductsService, useValue: { getRelatedProducts, assignRelatedProducts } },
        { provide: ProductFormSearchService, useValue: { searchProductsBySku } },
        { provide: ToasterService, useValue: { success } },
      ],
    });

    service = TestBed.inject(ProductRelatedProductsService);
    queryClient = TestBed.inject(QueryClient);
    service.configure({
      getShopId: () => shopId,
      getProductId: () => 'p1',
      isSidebarEnabled: () => sidebarEnabled,
    });
    await flush();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the related products of the product', () => {
    expect(getRelatedProducts).toHaveBeenCalledWith('p1');
    expect(ids()).toEqual(['p2', 'p3']);
    expect(service.isLoading()).toBe(false);
    expect(service.isLimitReached()).toBe(false);
  });

  it('searches by sku and hides the product itself and already related products', async () => {
    service.onSearchChange(' SN ');
    await flush();

    expect(searchProductsBySku).toHaveBeenCalledWith('shop-1', 'SN');
    expect(service.searchResults().map((item) => item.id)).toEqual(['p4']);
    expect(service.isSearchLoading()).toBe(false);
  });

  it('falls back to empty results when the search fails', async () => {
    searchProductsBySku.mockRejectedValueOnce(new Error('boom'));

    service.onSearchChange('SN');
    await flush();

    expect(service.searchResults()).toEqual([]);
  });

  it('clears results for a blank query or a missing shop', async () => {
    service.onSearchChange('SN');
    await flush();
    service.onSearchChange('  ');
    expect(service.searchResults()).toEqual([]);

    shopId = null;
    service.onSearchChange('SN');
    await flush();
    expect(searchProductsBySku).toHaveBeenCalledTimes(1);
  });

  it('does not search while the sidebar is disabled', async () => {
    sidebarEnabled = false;

    service.onSearchChange('SN');
    await flush();

    expect(searchProductsBySku).not.toHaveBeenCalled();
    expect(service.searchValue()).toBe('SN');
  });

  it('appends a search result, resets the search and toasts', async () => {
    service.onSearchChange('SN');
    await flush();

    service.onAdd(' p4 ');
    await flush();

    expect(assignRelatedProducts).toHaveBeenCalledWith('p1', { productIds: ['p2', 'p3', 'p4'] });
    expect(queryClient.getQueryData(SHOP_QUERY_KEYS.relatedProducts('p1'))).toEqual([
      { id: 'p2', name: 'p2' },
      { id: 'p3', name: 'p3' },
      { id: 'p4', name: 'p4' },
    ]);
    expect(service.searchValue()).toBe('');
    expect(service.isSaving()).toBe(false);
    expect(success).toHaveBeenCalledWith(
      PRODUCT_FORM_TOAST_TEXTS.RELATED_PRODUCT_ADD_SUCCESS_TITLE,
    );
  });

  it('ignores adding an id that is not among the search results', async () => {
    service.onAdd('p9');
    service.onAdd('  ');
    await flush();

    expect(assignRelatedProducts).not.toHaveBeenCalled();
  });

  it('removes a related product', async () => {
    service.onRemove('p2');
    await flush();

    expect(assignRelatedProducts).toHaveBeenCalledWith('p1', { productIds: ['p3'] });
    expect(success).toHaveBeenCalledWith(
      PRODUCT_FORM_TOAST_TEXTS.RELATED_PRODUCT_REMOVE_SUCCESS_TITLE,
    );
  });

  it('ignores removing an unknown id', async () => {
    service.onRemove('p9');
    await flush();

    expect(assignRelatedProducts).not.toHaveBeenCalled();
  });

  it('moves related products and skips impossible moves', async () => {
    service.onMoveUp('p2');
    service.onMoveDown('p3');
    await flush();
    expect(assignRelatedProducts).not.toHaveBeenCalled();

    service.onMoveDown('p2');
    await flush();

    expect(assignRelatedProducts).toHaveBeenCalledWith('p1', { productIds: ['p3', 'p2'] });
    expect(success).toHaveBeenCalledWith(
      PRODUCT_FORM_TOAST_TEXTS.RELATED_PRODUCTS_SORT_SUCCESS_TITLE,
    );

    service.onMoveUp('p2');
    await flush();
    expect(assignRelatedProducts).toHaveBeenLastCalledWith('p1', { productIds: ['p2', 'p3'] });
  });

  it('does not save while another save is running or the sidebar is disabled', async () => {
    service.isSaving.set(true);
    service.onRemove('p2');
    service.isSaving.set(false);
    sidebarEnabled = false;
    service.onRemove('p2');
    await flush();

    expect(assignRelatedProducts).not.toHaveBeenCalled();
  });

  it('blocks searching and adding once the limit is reached', async () => {
    queryClient.setQueryData(
      SHOP_QUERY_KEYS.relatedProducts('p1'),
      Array.from({ length: PRODUCT_FORM_RELATED_PRODUCTS_MAX }, (_, index) => ({
        id: `r${index}`,
      })),
    );
    await flush();

    service.onSearchChange('SN');
    await flush();
    service.onAdd('p4');
    await flush();

    expect(service.isLimitReached()).toBe(true);
    expect(searchProductsBySku).not.toHaveBeenCalled();
    expect(assignRelatedProducts).not.toHaveBeenCalled();
  });
});
