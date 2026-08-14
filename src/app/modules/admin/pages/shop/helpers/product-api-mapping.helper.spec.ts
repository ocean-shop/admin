import { ProductStatus } from '../pages/products/models/product-status.enum';
import { ProductType } from '../pages/products/models/product-type.enum';
import {
  extractProductAttributes,
  extractProductImages,
  extractProductTags,
  extractProductVariations,
  mapProductToFormModel,
} from './product-api-mapping.helper';

describe('product-api-mapping.helper', () => {
  it('maps product to form model with normalized defaults', () => {
    const formModel = mapProductToFormModel({
      title: 'Fallback title',
      type: 'variable',
      status: 'archived',
      price: 99.5,
      oldPrice: null,
      available: false,
    });

    expect(formModel).toEqual({
      name: 'Fallback title',
      type: ProductType.Variable,
      description: '',
      price: '99.50',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Archived,
      available: false,
    });
  });

  it('extracts unique attribute and tag labels from mixed shapes', () => {
    const product = {
      attributes: [
        'attr-raw',
        { attributeTypeId: 'attr-2', attributeType: { name: 'Колір', value: 'Синій' } },
        { id: 'attr-2', name: 'Колір', value: 'Синій' },
      ],
      tags: ['tag-raw', { tag: { id: 'tag-2' } }, { id: 'tag-2', name: 'Льон' }],
    };

    expect(
      extractProductAttributes(product, {
        attributesFallbackLabel: 'Атрибути',
        tagsFallbackLabel: 'Теги',
      }),
    ).toEqual([
      { id: 'attr-raw', label: 'attr-raw' },
      { id: 'attr-2', label: 'Колір: Синій' },
    ]);

    expect(
      extractProductTags(product, {
        attributesFallbackLabel: 'Атрибути',
        tagsFallbackLabel: 'Теги',
      }),
    ).toEqual([
      { id: 'tag-raw', label: 'tag-raw' },
      { id: 'tag-2', label: 'Теги' },
    ]);
  });

  it('extracts product images from mixed shapes', () => {
    expect(
      extractProductImages({
        images: [
          'https://cdn.example.com/first.jpg',
          { id: 'img-2', image: 'https://cdn.example.com/second.jpg', name: 'Second image' },
          { url: 'https://cdn.example.com/third.jpg', title: 'Third image' },
          { src: '' },
        ],
      }),
    ).toEqual([
      {
        id: 'product-image-0-https://cdn.example.com/first.jpg',
        name: 'Image 1',
        imageDataUrl: 'https://cdn.example.com/first.jpg',
      },
      {
        id: 'img-2',
        name: 'Second image',
        imageDataUrl: 'https://cdn.example.com/second.jpg',
      },
      {
        id: 'product-image-2-https://cdn.example.com/third.jpg',
        name: 'Third image',
        imageDataUrl: 'https://cdn.example.com/third.jpg',
      },
    ]);
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
        ],
      }),
    ).toEqual([
      {
        localId: 'variation-1',
        id: 'variation-1',
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
        attributeSearchValue: '',
        attributeSearchResults: [],
        isAttributeSearchLoading: false,
        images: [{ id: 'img-1', name: 'V1', imageDataUrl: 'https://cdn.example.com/var-1.jpg' }],
        isSaving: false,
      },
      {
        localId: 'variation-variation-raw',
        id: 'variation-raw',
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
      },
    ]);
  });
});
