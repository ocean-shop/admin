import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { AttributesService } from '../../../pages/attributes/services/attributes.service';
import { TagsService } from '../../../pages/tags/services/tags.service';
import {
  PRODUCT_FORM_SEARCH_QUERY_LIMIT,
  PRODUCT_FORM_SEARCH_QUERY_PAGE,
} from '../constants/product-form.constants';
import { ProductFormSearchService } from './product-form-search.service';

describe('ProductFormSearchService', () => {
  let service: ProductFormSearchService;
  let getAttributes: ReturnType<typeof vi.fn>;
  let getTags: ReturnType<typeof vi.fn>;

  const buildPage = <T>(items: T[]) => ({
    items,
    total: items.length,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  beforeEach(() => {
    getAttributes = vi.fn().mockReturnValue(of(buildPage([{ id: 'a1', name: 'Color' }])));
    getTags = vi.fn().mockReturnValue(of(buildPage([{ id: 't1', name: 'Linen' }])));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: AttributesService, useValue: { getAttributes } },
        { provide: TagsService, useValue: { getTags } },
      ],
    });

    service = TestBed.inject(ProductFormSearchService);
  });

  it('searches attributes by name and returns the items', async () => {
    await expect(service.searchAttributes('shop-1', 'col')).resolves.toEqual([
      { id: 'a1', name: 'Color' },
    ]);
    expect(getAttributes).toHaveBeenCalledWith({
      page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
      limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
      shopId: 'shop-1',
      name: 'col',
    });
  });

  it('searches tags by name and returns the items', async () => {
    await expect(service.searchTags('shop-1', 'lin')).resolves.toEqual([
      { id: 't1', name: 'Linen' },
    ]);
    expect(getTags).toHaveBeenCalledWith({
      page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
      limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
      shopId: 'shop-1',
      name: 'lin',
    });
  });
});
