import { buildProductFormSeeds } from './product-form-seeds.helper';

describe('product-form-seeds.helper', () => {
  it('returns empty seeds without a product', () => {
    expect(buildProductFormSeeds(null)).toEqual({
      categoryIds: new Set(),
      attributes: [],
      tags: [],
      images: [],
      variations: [],
    });
  });

  it('extracts every section of a loaded product', () => {
    const seeds = buildProductFormSeeds({
      categories: ['cat-1'],
      attributes: ['attr-1'],
      tags: ['tag-1'],
      images: ['https://cdn.example.com/a.jpg'],
      variations: ['var-1'],
    });

    expect(seeds.categoryIds).toEqual(new Set(['cat-1']));
    expect(seeds.attributes).toEqual([{ id: 'attr-1', label: 'attr-1' }]);
    expect(seeds.tags).toEqual([{ id: 'tag-1', label: 'tag-1' }]);
    expect(seeds.images.map((image) => image.imageDataUrl)).toEqual([
      'https://cdn.example.com/a.jpg',
    ]);
    expect(seeds.variations.map((variation) => variation.id)).toEqual(['var-1']);
  });
});
