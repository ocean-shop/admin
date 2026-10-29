import { PRODUCT_FALLBACK_LABELS } from '../constants/product-fallback-labels.constants';
import {
  mapAttributeSearchResults,
  mapTagSearchResults,
  removeProductFormOption,
  upsertProductFormOption,
} from './product-search-results.helper';

describe('product-search-results.helper', () => {
  it('maps attribute search results with filters and fallbacks', () => {
    const items = [
      { id: 'a1', name: 'Color', value: 'Blue' },
      { id: 'a2', name: 'Size', value: '' },
      { id: '', name: 'Broken', value: 'X' },
      { id: 'a3', name: '', value: 'Cotton' },
      { id: 'a4', name: 'Fit', value: null },
    ];

    expect(mapAttributeSearchResults(items, [{ id: 'a2', label: 'Size' }])).toEqual([
      { id: 'a1', label: 'Color: Blue' },
      { id: 'a3', label: `${PRODUCT_FALLBACK_LABELS.ATTRIBUTE}: Cotton` },
      { id: 'a4', label: 'Fit' },
    ]);
  });

  it('maps tag search results with filters and fallback label', () => {
    const items = [
      { id: 't1', name: 'Summer' },
      { id: 't2', name: '' },
      { id: '', name: 'Broken' },
    ];

    expect(mapTagSearchResults(items, [{ id: 't1', label: 'Summer' }])).toEqual([
      { id: 't2', label: PRODUCT_FALLBACK_LABELS.TAG },
    ]);
  });

  it('upserts options without duplicates', () => {
    const options = [{ id: 'a1', label: 'Color: Blue' }];

    expect(upsertProductFormOption(options, { id: 'a1', label: 'Other' })).toBe(options);
    expect(upsertProductFormOption(options, { id: 'a2', label: 'Size: M' })).toEqual([
      { id: 'a1', label: 'Color: Blue' },
      { id: 'a2', label: 'Size: M' },
    ]);
  });

  it('removes options by id', () => {
    expect(
      removeProductFormOption(
        [
          { id: 't1', label: 'Summer' },
          { id: 't2', label: 'Winter' },
        ],
        't1',
      ),
    ).toEqual([{ id: 't2', label: 'Winter' }]);
  });
});
