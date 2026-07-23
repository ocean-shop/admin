import { ProductStatus } from '../pages/products/models/product-status.enum';
import { ProductType } from '../pages/products/models/product-type.enum';
import {
  extractProductAttributes,
  extractProductTags,
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
});
