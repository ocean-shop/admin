import {
  PRODUCT_VARIATION_ATTRIBUTE_ID_PREFIX,
  PRODUCT_VARIATION_ID_PREFIX,
} from '../../constants/product-api-mapping.constants';
import {
  createEmptyProductFormVariation,
  extractProductVariations,
} from './product-variation-mapping.helper';

describe('product-variation-mapping.helper', () => {
  it('createEmptyProductFormVariation builds a blank, available variation', () => {
    expect(createEmptyProductFormVariation('local-1')).toEqual({
      localId: 'local-1',
      id: null,
      title: '',
      name: '',
      price: '',
      oldPrice: '',
      sku: '',
      available: true,
      isMain: false,
      attributes: [],
      attributeSearchValue: '',
      attributeSearchResults: [],
      isAttributeSearchLoading: false,
      images: [],
      isSaving: false,
    });
    expect(createEmptyProductFormVariation('local-2', 'var-2').id).toBe('var-2');
  });

  it('extracts product variations from mixed shapes', () => {
    expect(
      extractProductVariations({
        variations: [
          {
            id: 'variation-1',
            title: 'Синій M',
            name: 'Синій / M',
            sku: 'SKU-1',
            price: 99.5,
            oldPrice: 120,
            available: false,
            isDefault: true,
            attributes: [
              {
                id: 'attribute-link-1',
                attributeTypeId: '11111111-1111-4111-8111-111111111111',
                name: 'Колір',
                value: 'Синій',
              },
            ],
            images: [{ id: 'img-1', image: 'https://cdn.example.com/var-1.jpg', name: 'V1' }],
          },
          'variation-raw',
          ' ',
        ],
      }),
    ).toEqual([
      {
        ...createEmptyProductFormVariation('variation-1', 'variation-1'),
        title: 'Синій M',
        name: 'Синій / M',
        price: '99.50',
        oldPrice: '120.00',
        sku: 'SKU-1',
        available: false,
        isMain: true,
        attributes: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            attributeTypeId: '11111111-1111-4111-8111-111111111111',
            name: 'Колір',
            value: 'Синій',
            label: 'Колір: Синій',
          },
        ],
        images: [{ id: 'img-1', name: 'V1', imageDataUrl: 'https://cdn.example.com/var-1.jpg' }],
      },
      createEmptyProductFormVariation(
        `${PRODUCT_VARIATION_ID_PREFIX}-variation-raw`,
        'variation-raw',
      ),
    ]);
  });

  it('uses the index as local id for variations without id and maps attribute fallbacks', () => {
    const [variation] = extractProductVariations({
      variations: [
        {
          attributes: [
            'attr-raw',
            ' ',
            { attributeType: { name: 'Розмір', value: 'M' } },
            { id: 'empty' },
          ],
        },
      ],
    });

    const localId = `${PRODUCT_VARIATION_ID_PREFIX}-0`;
    expect(variation.localId).toBe(localId);
    expect(variation.id).toBeNull();
    expect(variation.attributes).toEqual([
      {
        id: 'attr-raw',
        attributeTypeId: 'attr-raw',
        name: 'attr-raw',
        value: '',
        label: 'attr-raw',
      },
      {
        id: `${PRODUCT_VARIATION_ATTRIBUTE_ID_PREFIX}-${localId}-2`,
        attributeTypeId: '',
        name: 'Розмір',
        value: 'M',
        label: 'Розмір: M',
      },
    ]);
  });

  it('returns an empty list for products without variations', () => {
    expect(extractProductVariations({})).toEqual([]);
  });
});
