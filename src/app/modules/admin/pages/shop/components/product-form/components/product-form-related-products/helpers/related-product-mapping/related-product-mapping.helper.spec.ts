import { PRODUCT_FALLBACK_LABELS } from '../../../../../../constants/product-fallback-labels.constants';
import { ProductStatus } from '../../../../../../pages/products/models/product-status.enum';
import { PRODUCT_FORM_STATUS_OPTIONS } from '../../../../constants/product-form.constants';
import { excludeRelatedProducts, mapRelatedProducts } from './related-product-mapping.helper';

const draftLabel = PRODUCT_FORM_STATUS_OPTIONS.find(
  (option) => option.value === ProductStatus.Draft,
)?.label;

describe('related-product-mapping helper', () => {
  describe('mapRelatedProducts', () => {
    it('returns an empty list for missing input', () => {
      expect(mapRelatedProducts(null)).toEqual([]);
      expect(mapRelatedProducts(undefined)).toEqual([]);
    });

    it('maps an active product with its own first image, keeping order', () => {
      expect(
        mapRelatedProducts([
          {
            id: ' p1 ',
            name: ' Wetsuit ',
            sku: ' WS-1 ',
            status: ProductStatus.Active,
            images: [{ image: 'https://cdn/1.jpg' }, { image: 'https://cdn/2.jpg' }],
          },
          { id: 'p2', title: 'Fins', status: 'ACTIVE' },
        ]),
      ).toEqual([
        {
          id: 'p1',
          name: 'Wetsuit',
          sku: 'WS-1',
          imageUrl: 'https://cdn/1.jpg',
          hiddenStatusLabel: null,
        },
        { id: 'p2', name: 'Fins', sku: '', imageUrl: '', hiddenStatusLabel: null },
      ]);
    });

    it('falls back to the first variation image and the fallback name', () => {
      const [item] = mapRelatedProducts([
        {
          id: 'p1',
          images: [],
          variations: ['variation-id', { images: [] }, { images: ['https://cdn/v.jpg'] }],
        },
      ]);

      expect(item.imageUrl).toBe('https://cdn/v.jpg');
      expect(item.name).toBe(PRODUCT_FALLBACK_LABELS.PRODUCT);
    });

    it('labels statuses hidden from the storefront', () => {
      const [draft, unknown, missing] = mapRelatedProducts([
        { id: 'p1', status: ProductStatus.Draft },
        { id: 'p2', status: 'unknown' },
        { id: 'p3', status: null },
      ]);

      expect(draft.hiddenStatusLabel).toBe(draftLabel);
      expect(unknown.hiddenStatusLabel).toBeNull();
      expect(missing.hiddenStatusLabel).toBeNull();
    });

    it('drops products without an id', () => {
      expect(mapRelatedProducts([{ id: '  ' }, { name: 'No id' }])).toEqual([]);
    });
  });

  describe('excludeRelatedProducts', () => {
    it('removes excluded ids', () => {
      const items = mapRelatedProducts([{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]);

      expect(excludeRelatedProducts(items, new Set(['p1', 'p3'])).map((item) => item.id)).toEqual([
        'p2',
      ]);
    });
  });
});
