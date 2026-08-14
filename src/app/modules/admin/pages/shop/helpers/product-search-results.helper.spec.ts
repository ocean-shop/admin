import {
  mapAttributeSearchResults,
  mapTagSearchResults,
  removeAssignedAttribute,
  removeAssignedTag,
  upsertAssignedAttribute,
  upsertAssignedTag,
} from './product-search-results.helper';

describe('product-search-results.helper', () => {
  it('maps attribute search results with filters and fallbacks', () => {
    const items = [
      { id: 'a1', name: 'Color', value: 'Blue' },
      { id: 'a2', name: 'Size', value: '' },
      { id: '', name: 'Broken', value: 'X' },
      { id: 'a3', name: '', value: 'Cotton' },
    ];

    expect(mapAttributeSearchResults(items as any, [{ id: 'a2', label: 'Size' }])).toEqual([
      { id: 'a1', label: 'Color: Blue' },
      { id: 'a3', label: 'Атрибут: Cotton' },
    ]);
  });

  it('maps tag search results with filters and fallback label', () => {
    const items = [
      { id: 't1', name: 'Summer' },
      { id: 't2', name: '' },
      { id: '', name: 'Broken' },
    ];

    expect(mapTagSearchResults(items as any, [{ id: 't1', label: 'Summer' }])).toEqual([
      { id: 't2', label: 'Тег' },
    ]);
  });

  it('upserts and removes assigned attributes and tags', () => {
    expect(
      upsertAssignedAttribute([{ id: 'a1', label: 'Color: Blue' }], {
        id: 'a1',
        label: 'Color: Blue',
      }),
    ).toEqual([{ id: 'a1', label: 'Color: Blue' }]);

    expect(
      upsertAssignedAttribute([{ id: 'a1', label: 'Color: Blue' }], {
        id: 'a2',
        label: 'Size: M',
      }),
    ).toEqual([
      { id: 'a1', label: 'Color: Blue' },
      { id: 'a2', label: 'Size: M' },
    ]);

    expect(
      upsertAssignedTag([{ id: 't1', label: 'Summer' }], {
        id: 't1',
        label: 'Summer',
      }),
    ).toEqual([{ id: 't1', label: 'Summer' }]);

    expect(
      upsertAssignedTag([{ id: 't1', label: 'Summer' }], {
        id: 't2',
        label: 'Sale',
      }),
    ).toEqual([
      { id: 't1', label: 'Summer' },
      { id: 't2', label: 'Sale' },
    ]);

    expect(
      removeAssignedAttribute(
        [
          { id: 'a1', label: 'Color' },
          { id: 'a2', label: 'Size' },
        ],
        'a1',
      ),
    ).toEqual([{ id: 'a2', label: 'Size' }]);

    expect(
      removeAssignedTag(
        [
          { id: 't1', label: 'Summer' },
          { id: 't2', label: 'Sale' },
        ],
        't2',
      ),
    ).toEqual([{ id: 't1', label: 'Summer' }]);
  });
});
