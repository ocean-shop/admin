import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { ABC_CLASS_META, PRODUCT_REPORT_TEXTS } from '../../constants/product-report.constants';
import { ProductReportApi } from '../../models/product-report-api.model';
import {
  buildAbcFilterTabs,
  buildProductReportView,
  filterTopProducts,
  isAbcFilter,
  resolveAbcClass,
} from './product-report-mapping.helper';

const now = new Date('2026-11-27T12:00:00.000Z');

const report: ProductReportApi = {
  totalRevenue: 100000,
  productsSold: 13,
  abcSummary: [
    { abcClass: 'A', productsCount: 3, revenue: 80000, revenueShare: 0.8 },
    { abcClass: 'B', productsCount: 4, revenue: 15000, revenueShare: 0.15 },
    { abcClass: 'C', productsCount: 6, revenue: 5000, revenueShare: 0.05 },
  ],
  topProducts: [
    {
      productId: ' p-1 ',
      name: 'Iphone 14 pro max',
      revenue: 72400,
      unitsSold: 5,
      ordersCount: 4,
      abcClass: 'A',
      revenueShare: 0.724,
      cumulativeShare: 0.724,
    },
    { productId: 'p-2', name: '  ', abcClass: 'X', revenue: null },
  ],
  growing: [
    { productId: 'p-3', name: 'Навушники', revenue: 6300, revenueChangePercent: 65 },
    { productId: 'p-4', name: 'Новинка', revenue: 1200, revenueChangePercent: null },
  ],
  declining: [{ productId: 'p-5', name: 'Ноутбук', revenue: 46900, revenueChangePercent: -45 }],
  deadStock: {
    days: 60,
    total: 5,
    items: [
      { productId: 'p-6', name: 'Iphone 3gs', price: 1000, lastSoldAt: null },
      { productId: 'p-7', name: 'Тримач', price: 250, lastSoldAt: '2026-08-28T10:00:00.000Z' },
    ],
  },
  insights: [{ code: 'dead_stock', severity: 'warning', message: '5 товарів не продаються' }],
};

describe('product-report-mapping helper', () => {
  it('resolves ABC classes with a fallback', () => {
    expect(resolveAbcClass('A')).toBe('A');
    expect(resolveAbcClass('Z')).toBe('C');
    expect(resolveAbcClass(null)).toBe('C');
  });

  it('returns null without a report', () => {
    expect(buildProductReportView(undefined, 60, now)).toBeNull();
  });

  it('maps ABC summary cards and the stacked bar', () => {
    const view = buildProductReportView(report, 60, now);

    expect(view?.abcClasses[0]).toEqual({
      abcClass: 'A',
      title: ABC_CLASS_META.A.title,
      tone: 'primary',
      revenue: '80 000 ₴',
      shareLabel: `80% ${PRODUCT_REPORT_TEXTS.ABC_REVENUE_SUFFIX}`,
      productsCount: 3,
      countLabel: '3 товари',
      metaLabel: `80% ${PRODUCT_REPORT_TEXTS.ABC_REVENUE_SUFFIX} · 3 товари`,
    });
    expect(view?.abcSegments.map((segment) => segment.value)).toEqual([0.8, 0.15, 0.05]);
    expect(view?.abcSegments[1].label).toBe('B · 15%');
    expect(view?.abcAriaLabel).toBe(`${PRODUCT_REPORT_TEXTS.ABC_ARIA_PREFIX} A 80%, B 15%, C 5%`);
  });

  it('maps top products with ranks and fallbacks', () => {
    const [first, second] = buildProductReportView(report, 60, now)?.topProducts ?? [];

    expect(first).toEqual({
      productId: 'p-1',
      rank: 1,
      name: 'Iphone 14 pro max',
      abcClass: 'A',
      revenue: '72 400 ₴',
      shareLabel: '72,4%',
      cumulativeBar: [{ value: 0.724, tone: 'primary' }],
      cumulativeLabel: '72%',
      unitsLabel: `5 ${PRODUCT_REPORT_TEXTS.UNITS_SUFFIX}`,
      ordersLabel: '4',
    });
    expect(second.name).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(second.abcClass).toBe('C');
    expect(second.rank).toBe(2);
  });

  it('maps growing and declining products; new ones get a label', () => {
    const [growing, declining] = buildProductReportView(report, 60, now)?.trends ?? [];

    expect(growing.rows[0].change).toEqual({ label: '+65,0%', direction: 'up', tone: 'success' });
    expect(growing.rows[1].change).toEqual({
      label: PRODUCT_REPORT_TEXTS.NEW_PRODUCT_LABEL,
      direction: 'up',
      tone: 'success',
    });
    expect(declining.rows[0].change.tone).toBe('danger');
    expect(declining.kind).toBe('declining');
  });

  it('labels declining products without previous sales as new too', () => {
    const view = buildProductReportView(
      { declining: [{ productId: 'p', revenueChangePercent: null }] },
      60,
      now,
    );

    expect(view?.trends[1].rows[0].change).toEqual({
      label: PRODUCT_REPORT_TEXTS.NEW_PRODUCT_LABEL,
      direction: 'down',
      tone: 'danger',
    });
  });

  it('maps dead stock', () => {
    const deadStock = buildProductReportView(report, 30, now)?.deadStock;

    expect(deadStock?.days).toBe(60);
    expect(deadStock?.total).toBe(5);
    expect(deadStock?.rows).toEqual([
      {
        productId: 'p-6',
        name: 'Iphone 3gs',
        price: '1 000 ₴',
        lastSoldLabel: PRODUCT_REPORT_TEXTS.DEAD_STOCK_NEVER_SOLD,
        daysLabel: EMPTY_VALUE_PLACEHOLDER,
      },
      {
        productId: 'p-7',
        name: 'Тримач',
        price: '250 ₴',
        lastSoldLabel: '28.08.2026',
        daysLabel: '91',
      },
    ]);
  });

  it('falls back to empty sections and the requested dead stock days', () => {
    const view = buildProductReportView({}, 90, now);

    expect(view?.productsSold).toBe(0);
    expect(view?.topProducts).toEqual([]);
    expect(view?.deadStock).toEqual({ days: 90, total: 0, rows: [] });
    expect(view?.abcClasses.map((item) => item.countLabel)).toEqual([
      '0 товарів',
      '0 товарів',
      '0 товарів',
    ]);
    expect(view?.trends.every((trend) => trend.rows.length === 0)).toBe(true);
  });

  it('uses the current date by default', () => {
    expect(buildProductReportView({}, 60)?.deadStock.rows).toEqual([]);
  });

  it('filters top products and builds class tabs', () => {
    const rows = buildProductReportView(report, 60, now)?.topProducts ?? [];

    expect(filterTopProducts(rows, 'all')).toHaveLength(2);
    expect(filterTopProducts(rows, 'A').map((row) => row.productId)).toEqual(['p-1']);
    expect(buildAbcFilterTabs(rows)).toEqual([
      { value: 'all', label: PRODUCT_REPORT_TEXTS.TOP_FILTER_ALL, countLabel: '2' },
      { value: 'A', label: `${PRODUCT_REPORT_TEXTS.TOP_FILTER_CLASS_PREFIX} A`, countLabel: '1' },
      { value: 'B', label: `${PRODUCT_REPORT_TEXTS.TOP_FILTER_CLASS_PREFIX} B`, countLabel: '0' },
      { value: 'C', label: `${PRODUCT_REPORT_TEXTS.TOP_FILTER_CLASS_PREFIX} C`, countLabel: '1' },
    ]);
  });

  it('checks ABC filter values', () => {
    expect(isAbcFilter('all')).toBe(true);
    expect(isAbcFilter('B')).toBe(true);
    expect(isAbcFilter('D')).toBe(false);
  });
});
