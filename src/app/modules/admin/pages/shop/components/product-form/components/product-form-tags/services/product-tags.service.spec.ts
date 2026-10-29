import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormSearchService } from '../../../services/product-form-search.service';
import { ProductTagsService } from './product-tags.service';

describe('ProductTagsService', () => {
  let service: ProductTagsService;
  let searchTags: ReturnType<typeof vi.fn>;
  let toggleTag: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    searchTags = vi.fn().mockResolvedValue([
      { id: 'tag-1', name: 'Summer' },
      { id: 'tag-2', name: 'Assigned' },
    ]);
    toggleTag = vi.fn().mockReturnValue(of(undefined));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductTagsService,
        { provide: ProductsService, useValue: { toggleTag } },
        { provide: ProductFormSearchService, useValue: { searchTags } },
        { provide: ToasterService, useValue: { success: vi.fn() } },
      ],
    });

    service = TestBed.inject(ProductTagsService);
  });

  it('maps tag search results, skipping already assigned tags', async () => {
    service.assignedItems.set([{ id: 'tag-2', label: 'Assigned' }]);

    await expect((service as any).searchItems('shop-1', 'sum')).resolves.toEqual([
      { id: 'tag-1', label: 'Summer' },
    ]);
    expect(searchTags).toHaveBeenCalledWith('shop-1', 'sum');
  });

  it('toggles the tag of the product', async () => {
    await lastValueFrom(
      (service as any).toggleItem({ productId: 'product-1', itemId: 'tag-1', assign: true }),
    );

    expect(toggleTag).toHaveBeenCalledWith('product-1', { tagId: 'tag-1', assign: true });
  });
});
