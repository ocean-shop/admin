import { Injectable, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOP_QUERY_KEYS } from '../../../constants/shop-query-keys.constants';
import { ProductsService } from '../../../pages/products/services/products.service';
import { PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR } from '../constants/product-form.constants';
import { ProductFormSectionService } from './product-form-section.service';

@Injectable()
class TestSectionService extends ProductFormSectionService {
  shopId(): string | null {
    return this.getShopId();
  }

  productId(): string | null {
    return this.getProductId();
  }

  enabled(): boolean {
    return this.isSidebarEnabled();
  }

  invalidate(productId: string): void {
    this.invalidateProductQueries(productId);
  }
}

describe('ProductFormSectionService', () => {
  let service: TestSectionService;
  let invalidateQueries: ReturnType<typeof vi.spyOn>;
  let shopId: string | null;

  beforeEach(() => {
    shopId = ' shop-1 ';
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        TestSectionService,
        { provide: ProductsService, useValue: {} },
        { provide: ToasterService, useValue: { success: vi.fn() } },
      ],
    });

    service = TestBed.inject(TestSectionService);
    invalidateQueries = vi.spyOn(TestBed.inject(QueryClient), 'invalidateQueries');
  });

  it('throws when used before configure()', () => {
    expect(() => service.shopId()).toThrowError(PRODUCT_FORM_SERVICE_NOT_CONFIGURED_ERROR);
  });

  describe('when configured', () => {
    beforeEach(() => {
      service.configure({
        getShopId: () => shopId,
        getProductId: () => '   ',
        isSidebarEnabled: () => true,
      });
    });

    it('reads trimmed ids and maps blank ones to null', () => {
      expect(service.shopId()).toBe('shop-1');
      expect(service.productId()).toBeNull();
      expect(service.enabled()).toBe(true);
    });

    it('invalidates the product and the product lists of the shop', () => {
      service.invalidate('product-1');

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: SHOP_QUERY_KEYS.productById('product-1'),
      });
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: SHOP_QUERY_KEYS.productsScope('shop-1'),
      });
    });

    it('invalidates only the product when there is no shop', () => {
      shopId = null;

      service.invalidate('product-1');

      expect(invalidateQueries).toHaveBeenCalledTimes(1);
    });
  });
});
