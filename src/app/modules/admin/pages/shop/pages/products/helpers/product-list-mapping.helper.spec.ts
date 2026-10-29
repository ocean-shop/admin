import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { PRODUCT_FALLBACK_LABELS } from '../../../constants/product-fallback-labels.constants';
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  PRODUCTS_TEXTS,
} from '../constants/products.constants';
import { ProductStatus } from '../models/product-status.enum';
import { ProductType } from '../models/product-type.enum';
import {
  buildCategoryFilterOptions,
  mapProduct,
  resolveProductCategoryNames,
  resolveProductSortQuery,
  resolveProductStatusLabel,
  resolveProductTypeLabel,
} from './product-list-mapping.helper';

describe('product-list-mapping.helper', () => {
  it('resolveProductTypeLabel translates known types and formats the rest', () => {
    expect(resolveProductTypeLabel(' Simple ')).toBe(PRODUCT_TYPE_LABELS[ProductType.Simple]);
    expect(resolveProductTypeLabel('variable')).toBe(PRODUCT_TYPE_LABELS[ProductType.Variable]);
    expect(resolveProductTypeLabel('custom-type')).toBe('Custom Type');
    expect(resolveProductTypeLabel(undefined)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('resolveProductStatusLabel translates known statuses and formats the rest', () => {
    expect(resolveProductStatusLabel('active')).toBe(PRODUCT_STATUS_LABELS[ProductStatus.Active]);
    expect(resolveProductStatusLabel('DRAFT')).toBe(PRODUCT_STATUS_LABELS[ProductStatus.Draft]);
    expect(resolveProductStatusLabel('archived')).toBe(
      PRODUCT_STATUS_LABELS[ProductStatus.Archived],
    );
    expect(resolveProductStatusLabel('on_hold')).toBe('On Hold');
    expect(resolveProductStatusLabel('toString')).toBe('Tostring');
  });

  it('resolveProductCategoryNames reads strings and objects, dropping blanks', () => {
    expect(resolveProductCategoryNames([' Shoes ', { name: 'Hats' }, { name: ' ' }, ''])).toEqual([
      'Shoes',
      'Hats',
    ]);
    expect(resolveProductCategoryNames(null)).toEqual([]);
  });

  describe('mapProduct', () => {
    it('formats list values', () => {
      expect(
        mapProduct(
          {
            id: 'p-1',
            shopId: 'shop-1',
            title: ' Shirt ',
            sku: ' S-1 ',
            type: 'simple',
            status: 'active',
            price: 10,
            categories: ['Tops', { name: 'Sale' }],
          },
          'fallback',
        ),
      ).toEqual({
        id: 'p-1',
        shopId: 'shop-1',
        title: 'Shirt',
        sku: 'S-1',
        type: PRODUCT_TYPE_LABELS[ProductType.Simple],
        status: PRODUCT_STATUS_LABELS[ProductStatus.Active],
        price: '10.00',
        categories: 'Tops, Sale',
      });
    });

    it('falls back to name, then to the untitled label', () => {
      expect(mapProduct({ name: 'Named' }, 'shop').title).toBe('Named');

      const product = mapProduct({}, 'shop-fallback');
      expect(product.title).toBe(PRODUCTS_TEXTS.UNTITLED_PRODUCT);
      expect(product.shopId).toBe('shop-fallback');
      expect(product.categories).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(product.id).toBeTruthy();
    });
  });

  it('resolveProductSortQuery maps every sort value', () => {
    expect(resolveProductSortQuery('newest')).toEqual({ sortBy: 'createdAt', sortOrder: 'desc' });
    expect(resolveProductSortQuery('older')).toEqual({ sortBy: 'createdAt', sortOrder: 'asc' });
    expect(resolveProductSortQuery('alphabet')).toEqual({ sortBy: 'name', sortOrder: 'asc' });
  });

  it('buildCategoryFilterOptions builds an indented sorted tree', () => {
    expect(
      buildCategoryFilterOptions([
        { id: 'b', name: 'Boots', parentId: 'a' },
        { id: 'a', name: 'Shoes' },
        { id: 'self', name: 'Accessories', parentId: 'self' },
        { id: '', name: 'Ignored' },
      ]),
    ).toEqual([
      { value: 'self', label: 'Accessories', level: 0 },
      { value: 'a', label: 'Shoes', level: 0 },
      { value: 'b', label: 'Boots', parentId: 'a', level: 1 },
    ]);
  });

  it('buildCategoryFilterOptions labels unnamed categories by id', () => {
    expect(buildCategoryFilterOptions([{ id: 'c', name: ' ' }])).toEqual([
      { value: 'c', label: `${PRODUCT_FALLBACK_LABELS.CATEGORY_PREFIX} c`, level: 0 },
    ]);
  });
});
