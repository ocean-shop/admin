import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ProductsService } from '../../../../../../pages/products/services/products/products.service';
import { ProductFormSearchService } from '../../../../services/product-form-search/product-form-search.service';
import { ProductAttributesService } from './product-attributes.service';

describe('ProductAttributesService', () => {
  let service: ProductAttributesService;
  let searchAttributes: ReturnType<typeof vi.fn>;
  let toggleAttribute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    searchAttributes = vi.fn().mockResolvedValue([
      { id: 'attr-1', name: 'Color', value: 'Blue' },
      { id: 'attr-2', name: 'Size', value: 'M' },
    ]);
    toggleAttribute = vi.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductAttributesService,
        { provide: ProductsService, useValue: { toggleAttribute } },
        { provide: ProductFormSearchService, useValue: { searchAttributes } },
        { provide: ToasterService, useValue: { success: vi.fn() } },
      ],
    });

    service = TestBed.inject(ProductAttributesService);
  });

  it('maps attribute search results, skipping already assigned attributes', async () => {
    service.assignedItems.set([{ id: 'attr-2', label: 'Size: M' }]);

    await expect((service as any).searchItems('shop-1', 'col')).resolves.toEqual([
      { id: 'attr-1', label: 'Color: Blue' },
    ]);
    expect(searchAttributes).toHaveBeenCalledWith('shop-1', 'col');
  });

  it('toggles the attribute of the product', async () => {
    await lastValueFrom(
      (service as any).toggleItem({ productId: 'product-1', itemId: 'attr-1', assign: false }),
    );

    expect(toggleAttribute).toHaveBeenCalledWith('product-1', {
      attributeTypeId: 'attr-1',
      assign: false,
    });
  });
});
