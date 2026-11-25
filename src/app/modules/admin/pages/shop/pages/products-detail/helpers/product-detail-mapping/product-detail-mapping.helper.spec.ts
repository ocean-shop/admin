import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { VALUE_FORMAT_TEXTS } from '@core/constants/value-format.constants';
import { PRODUCT_FALLBACK_LABELS } from '../../../../constants/product-fallback-labels.constants';
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
} from '../../../products/constants/products.constants';
import { ProductStatus } from '../../../products/models/product-status.enum';
import { ProductType } from '../../../products/models/product-type.enum';
import { ProductApiItem } from '../../../products/models/product.model';
import { PRODUCTS_DETAIL_TEXTS } from '../../constants/products-detail.constants';
import {
  buildProductDetailAttributeLabels,
  buildProductDetailOverviewRows,
  buildProductDetailPricingRows,
  buildProductDetailRelatedItems,
  buildProductDetailSeoRows,
  buildProductDetailStatusRows,
  buildProductDetailSubtitle,
  buildProductDetailTagLabels,
  buildProductDetailVariationRows,
  countProductDetailMissingSeoFields,
  isVariableProduct,
  resolveProductDetailPrice,
  resolveProductDetailStatusTone,
  resolveProductDetailTitle,
} from './product-detail-mapping.helper';

const simpleProduct: ProductApiItem = {
  id: 'p-1',
  name: ' Nothing Phone 1 ',
  sku: '17',
  slug: 'nothing-phone-1',
  type: ProductType.Simple,
  status: ProductStatus.Active,
  price: 250,
  oldPrice: '279',
  available: true,
  isPopular: true,
  isMainBanner: false,
  updatedAt: '2026-11-24T18:20:00.000Z',
  createdAt: '2026-10-01T10:00:00.000Z',
  categories: [{ id: 'c-1', name: 'Смартфони' }, 'Nothing'],
  images: [{ id: 'i-1', url: 'https://cdn/1.png' }, 'https://cdn/2.png', { id: 'empty' }],
  tags: [{ id: 't-1', name: '5G' }, { tag: { id: 't-2', name: 'Android' } }],
  attributes: [{ id: 'a-1', name: 'Екран', value: '6,55″' }],
};

const variableProduct: ProductApiItem = {
  ...simpleProduct,
  type: 'Variable',
  variations: [
    {
      id: 'v-1',
      title: 'White',
      price: 250,
      oldPrice: 279,
      sku: '17-1',
      available: true,
      isDefault: true,
      attributes: [{ name: 'Колір', value: 'Білий' }],
      images: ['https://cdn/white.png'],
    },
    { id: 'v-2', name: 'Чорний', price: '299', available: false },
    'v-3',
  ],
};

describe('product-detail-mapping helper', () => {
  describe('resolveProductDetailTitle', () => {
    it('prefers name, then title, then the fallback', () => {
      expect(resolveProductDetailTitle(simpleProduct)).toBe('Nothing Phone 1');
      expect(resolveProductDetailTitle({ title: ' Title ' })).toBe('Title');
      expect(resolveProductDetailTitle({})).toBe(PRODUCT_FALLBACK_LABELS.PRODUCT);
    });
  });

  it('detects variable products case-insensitively', () => {
    expect(isVariableProduct(variableProduct)).toBe(true);
    expect(isVariableProduct(simpleProduct)).toBe(false);
    expect(isVariableProduct({})).toBe(false);
  });

  it('resolves the status tone with a neutral fallback', () => {
    expect(resolveProductDetailStatusTone(simpleProduct)).toBe('primary');
    expect(resolveProductDetailStatusTone({ status: 'weird' })).toBe('neutral');
  });

  describe('buildProductDetailSubtitle', () => {
    it('joins SKU, slug and update date', () => {
      const subtitle = buildProductDetailSubtitle(simpleProduct);

      expect(subtitle).toContain(`${PRODUCTS_DETAIL_TEXTS.SKU_PREFIX} 17 · /nothing-phone-1 · `);
      expect(subtitle).toContain(PRODUCTS_DETAIL_TEXTS.UPDATED_PREFIX);
    });

    it('skips missing parts', () => {
      expect(buildProductDetailSubtitle({ slug: 'only-slug' })).toBe('/only-slug');
      expect(buildProductDetailSubtitle({})).toBe('');
    });
  });

  describe('resolveProductDetailPrice', () => {
    it('returns the simple product price and discount', () => {
      expect(resolveProductDetailPrice(simpleProduct)).toEqual({
        current: '250.00',
        old: '279.00',
      });
    });

    it('omits a missing or zero old price and shows a placeholder for no price', () => {
      expect(resolveProductDetailPrice({ price: null, oldPrice: 0 })).toEqual({
        current: EMPTY_VALUE_PLACEHOLDER,
        old: null,
      });
    });

    it('shows the lowest variation price with a prefix when prices differ', () => {
      expect(resolveProductDetailPrice(variableProduct)).toEqual({
        current: `${PRODUCTS_DETAIL_TEXTS.PRICE_FROM_PREFIX} 250.00`,
        old: null,
      });
    });

    it('shows a single variation price without the prefix', () => {
      const product: ProductApiItem = {
        type: ProductType.Variable,
        variations: [{ price: 10 }, { price: '10.00' }],
      };

      expect(resolveProductDetailPrice(product).current).toBe('10.00');
    });

    it('falls back to the product price when variations have no prices', () => {
      const product: ProductApiItem = { type: ProductType.Variable, price: 5, variations: [] };

      expect(resolveProductDetailPrice(product).current).toBe('5.00');
    });
  });

  describe('buildProductDetailOverviewRows', () => {
    it('shows availability, categories and photo count of a simple product', () => {
      const rows = buildProductDetailOverviewRows(simpleProduct);

      expect(rows[0]).toEqual({
        label: PRODUCTS_DETAIL_TEXTS.AVAILABILITY_LABEL,
        value: PRODUCTS_DETAIL_TEXTS.AVAILABLE,
        tone: 'success',
      });
      expect(rows[1].value).toBe('Смартфони, Nothing');
      expect(rows[2].value).toBe('2');
    });

    it('counts available variations of a variable product', () => {
      const [availability] = buildProductDetailOverviewRows(variableProduct);

      expect(availability).toEqual({
        label: PRODUCTS_DETAIL_TEXTS.VARIATIONS_AVAILABILITY_LABEL,
        value: `2 ${PRODUCTS_DETAIL_TEXTS.VARIATIONS_AVAILABILITY_SEPARATOR} 3`,
      });
    });

    it('marks an unavailable product and empty categories', () => {
      const rows = buildProductDetailOverviewRows({ available: false });

      expect(rows[0].value).toBe(PRODUCTS_DETAIL_TEXTS.UNAVAILABLE);
      expect(rows[0].tone).toBe('neutral');
      expect(rows[1].value).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(rows[2].value).toBe('0');
    });
  });

  it('builds pricing rows for a simple product', () => {
    const rows = buildProductDetailPricingRows({ ...simpleProduct, oldPrice: null, sku: null });

    expect(rows.map((row) => row.value)).toEqual([
      '250.00',
      EMPTY_VALUE_PLACEHOLDER,
      EMPTY_VALUE_PLACEHOLDER,
      PRODUCTS_DETAIL_TEXTS.AVAILABLE,
    ]);
    expect(rows[0].emphasis).toBe(true);
    expect(rows[2].mono).toBe(true);
  });

  it('builds variation table rows', () => {
    const rows = buildProductDetailVariationRows(variableProduct);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      id: 'v-1',
      title: `White ${PRODUCTS_DETAIL_TEXTS.VARIATION_MAIN_SUFFIX}`,
      image: 'https://cdn/white.png',
      attributes: 'Колір: Білий',
      sku: '17-1',
      price: '250.00',
      oldPrice: '279.00',
      availability: PRODUCTS_DETAIL_TEXTS.AVAILABLE,
    });
    expect(rows[1]).toMatchObject({
      title: 'Чорний',
      image: null,
      attributes: EMPTY_VALUE_PLACEHOLDER,
      oldPrice: EMPTY_VALUE_PLACEHOLDER,
      availability: PRODUCTS_DETAIL_TEXTS.UNAVAILABLE,
    });
    expect(rows[2]['title']).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  describe('SEO', () => {
    it('counts missing meta fields', () => {
      expect(countProductDetailMissingSeoFields(simpleProduct)).toBe(2);
      expect(countProductDetailMissingSeoFields({ metaTitle: 'T', metaDescription: ' ' })).toBe(1);
    });

    it('marks missing meta fields and indexing', () => {
      const rows = buildProductDetailSeoRows(simpleProduct);

      expect(rows[0]).toMatchObject({ value: 'nothing-phone-1', mono: true });
      expect(rows[1]).toMatchObject({
        value: PRODUCTS_DETAIL_TEXTS.SEO_NOT_FILLED,
        tone: 'warning',
      });
      expect(rows[3].value).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(rows[4]).toMatchObject({ value: PRODUCTS_DETAIL_TEXTS.SEO_INDEXED, tone: 'success' });
    });

    it('shows filled meta fields and the no-index flag', () => {
      const rows = buildProductDetailSeoRows({
        metaTitle: ' Title ',
        metaDescription: 'Desc',
        canonicalUrl: 'https://shop/p',
        noIndex: true,
      });

      expect(rows[1]).toEqual({
        label: PRODUCTS_DETAIL_TEXTS.SEO_META_TITLE_LABEL,
        value: 'Title',
      });
      expect(rows[2].value).toBe('Desc');
      expect(rows[3].value).toBe('https://shop/p');
      expect(rows[4]).toMatchObject({
        value: PRODUCTS_DETAIL_TEXTS.SEO_NOT_INDEXED,
        tone: 'neutral',
      });
    });
  });

  it('builds status rows with translated values', () => {
    const rows = buildProductDetailStatusRows(simpleProduct);

    expect(rows[0]).toMatchObject({
      value: PRODUCT_STATUS_LABELS[ProductStatus.Active],
      tone: 'primary',
    });
    expect(rows[1].value).toBe(PRODUCT_TYPE_LABELS[ProductType.Simple]);
    expect(rows[2].value).toBe(VALUE_FORMAT_TEXTS.YES);
    expect(rows[3].value).toBe(VALUE_FORMAT_TEXTS.NO);
    expect(buildProductDetailStatusRows({})[2].value).toBe(VALUE_FORMAT_TEXTS.NO);
  });

  it('extracts tag and attribute labels', () => {
    expect(buildProductDetailTagLabels(simpleProduct)).toEqual(['5G', 'Android']);
    expect(buildProductDetailAttributeLabels(simpleProduct)).toEqual(['Екран: 6,55″']);
    expect(buildProductDetailTagLabels({})).toEqual([]);
  });

  it('builds related items with links and skips items without an id', () => {
    const items = buildProductDetailRelatedItems(
      [simpleProduct, { name: 'No id' }, { id: 'p-2', title: 'Tablet', price: 400 }],
      'shop-1',
    );

    expect(items).toEqual([
      {
        id: 'p-1',
        title: 'Nothing Phone 1',
        price: '250.00',
        image: 'https://cdn/1.png',
        href: '/admin/shop/shop-1/products/p-1',
      },
      {
        id: 'p-2',
        title: 'Tablet',
        price: '400.00',
        image: null,
        href: '/admin/shop/shop-1/products/p-2',
      },
    ]);
  });
});
