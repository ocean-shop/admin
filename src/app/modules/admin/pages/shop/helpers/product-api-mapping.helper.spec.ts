import { PRODUCT_IMAGE_ID_PREFIX } from '../constants/product-api-mapping.constants';
import { PRODUCT_FALLBACK_LABELS } from '../constants/product-fallback-labels.constants';
import { ProductStatus } from '../pages/products/models/product-status.enum';
import { ProductType } from '../pages/products/models/product-type.enum';
import {
  extractProductAttributes,
  extractProductCategoryIds,
  extractProductImages,
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
      isPopular: false,
      isMainBanner: false,
      slug: '',
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      noIndex: false,
    });
  });

  it('maps SEO fields to the form model', () => {
    const formModel = mapProductToFormModel({
      name: 'Coastal Shirt',
      slug: 'coastal-shirt',
      metaTitle: 'Coastal Shirt | Ocean',
      metaDescription: 'Linen shirt',
      canonicalUrl: 'https://ocean.shop/products/coastal-shirt',
      noIndex: true,
    });

    expect(formModel).toMatchObject({
      slug: 'coastal-shirt',
      metaTitle: 'Coastal Shirt | Ocean',
      metaDescription: 'Linen shirt',
      canonicalUrl: 'https://ocean.shop/products/coastal-shirt',
      noIndex: true,
    });
  });

  it('maps isPopular from the product API item', () => {
    const formModel = mapProductToFormModel({
      name: 'Coastal Shirt',
      isPopular: true,
      isMainBanner: false,
    });

    expect(formModel.isPopular).toBe(true);
  });
  it('falls back to simple / draft for unknown type and status', () => {
    const formModel = mapProductToFormModel({ type: 'unknown', status: null });

    expect(formModel.type).toBe(ProductType.Simple);
    expect(formModel.status).toBe(ProductStatus.Draft);
    expect(formModel.name).toBe('');
  });

  it('extracts category ids from mixed shapes, skipping empty ones', () => {
    expect(
      extractProductCategoryIds({ categories: [' cat-1 ', { id: 'cat-2' }, { id: null }, ''] }),
    ).toEqual(new Set(['cat-1', 'cat-2']));
    expect(extractProductCategoryIds({})).toEqual(new Set());
  });

  it('extracts unique attribute and tag labels from mixed shapes', () => {
    const product = {
      attributes: [
        'attr-raw',
        ' ',
        { attributeTypeId: 'attr-2', attributeType: { name: 'Колір', value: 'Синій' } },
        { id: 'attr-2', name: 'Колір', value: 'Синій' },
        { attributeType: { id: 'attr-3' } },
        { name: 'No id' },
      ],
      tags: [
        'tag-raw',
        ' ',
        { tag: { id: 'tag-2' } },
        { id: 'tag-2', name: 'Льон' },
        { name: 'x' },
      ],
    };

    expect(extractProductAttributes(product)).toEqual([
      { id: 'attr-raw', label: 'attr-raw' },
      { id: 'attr-2', label: 'Колір: Синій' },
      { id: 'attr-3', label: PRODUCT_FALLBACK_LABELS.ATTRIBUTE },
    ]);

    expect(extractProductTags(product)).toEqual([
      { id: 'tag-raw', label: 'tag-raw' },
      { id: 'tag-2', label: PRODUCT_FALLBACK_LABELS.TAG },
    ]);
  });

  it('reads attributes from attributeTypes when attributes are missing', () => {
    expect(extractProductAttributes({ attributeTypes: ['attr-1'] })).toEqual([
      { id: 'attr-1', label: 'attr-1' },
    ]);
    expect(extractProductTags({})).toEqual([]);
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
        id: `${PRODUCT_IMAGE_ID_PREFIX}-0-https://cdn.example.com/first.jpg`,
        name: `${PRODUCT_FALLBACK_LABELS.IMAGE_PREFIX} 1`,
        imageDataUrl: 'https://cdn.example.com/first.jpg',
      },
      {
        id: 'img-2',
        name: 'Second image',
        imageDataUrl: 'https://cdn.example.com/second.jpg',
      },
      {
        id: `${PRODUCT_IMAGE_ID_PREFIX}-2-https://cdn.example.com/third.jpg`,
        name: 'Third image',
        imageDataUrl: 'https://cdn.example.com/third.jpg',
      },
    ]);
    expect(extractProductImages({})).toEqual([]);
  });
});
