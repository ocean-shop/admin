import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { ChangeBadgeData } from '@ui/change-badge/models/change-badge-data.model';
import { TabItem } from '@ui/tabs/models/tab-item.model';
import {
  ABC_CLASS_META,
  ABC_CLASSES,
  ABC_DEFAULT_CLASS,
  PRODUCT_REPORT_ICONS,
  PRODUCT_REPORT_TEXTS,
} from '../../constants/product-report.constants';
import {
  REPORT_COUNT_WORDS,
  REPORT_DIGITS,
  REPORT_LIST_SEPARATOR,
} from '../../constants/report-format.constants';
import { AbcClass } from '../../models/abc-class.type';
import { AbcFilter } from '../../models/abc-filter.type';
import {
  AbcClassSummaryApi,
  AbcProductApi,
  DeadStockApi,
  ProductReportApi,
  ProductTrendApi,
} from '../../models/product-report-api.model';
import {
  AbcClassView,
  DeadStockView,
  ProductReportView,
  ProductTrendList,
  ProductTrendRow,
  TopProductRow,
} from '../../models/product-report-view.model';
import { ProductTrendKind } from '../../models/product-trend-kind.type';
import {
  buildPercentChange,
  formatReportCount,
  formatReportCountWithWord,
  formatReportMoney,
  formatReportShare,
  toReportNumber,
} from '../report-format/report-format.helper';
import { mapReportInsights } from '../report-insights/report-insights.helper';
import { daysSince, formatReportDateTime } from '../report-period/report-period.helper';

export const resolveAbcClass = (value: string | null | undefined): AbcClass =>
  ABC_CLASSES.find((abcClass) => abcClass === value) ?? ABC_DEFAULT_CLASS;

const buildAbcClasses = (summary: AbcClassSummaryApi[] | null | undefined): AbcClassView[] =>
  ABC_CLASSES.map((abcClass) => {
    const item = (summary ?? []).find((entry) => resolveAbcClass(entry.abcClass) === abcClass);
    const productsCount = Math.round(toReportNumber(item?.productsCount));
    const shareLabel = `${formatReportShare(item?.revenueShare)} ${PRODUCT_REPORT_TEXTS.ABC_REVENUE_SUFFIX}`;
    const countLabel = formatReportCountWithWord(productsCount, REPORT_COUNT_WORDS.PRODUCTS);

    return {
      abcClass,
      title: ABC_CLASS_META[abcClass].title,
      tone: ABC_CLASS_META[abcClass].tone,
      revenue: formatReportMoney(item?.revenue),
      shareLabel,
      productsCount,
      countLabel,
      metaLabel: [shareLabel, countLabel].join(REPORT_LIST_SEPARATOR),
    };
  });

const findRevenueShare = (
  summary: AbcClassSummaryApi[] | null | undefined,
  abcClass: AbcClass,
): number =>
  toReportNumber(
    (summary ?? []).find((entry) => resolveAbcClass(entry.abcClass) === abcClass)?.revenueShare,
  );

const mapTopProduct = (product: AbcProductApi, index: number): TopProductRow => {
  const abcClass = resolveAbcClass(product.abcClass);
  return {
    productId: product.productId?.trim() ?? '',
    rank: index + 1,
    name: product.name?.trim() || EMPTY_VALUE_PLACEHOLDER,
    abcClass,
    revenue: formatReportMoney(product.revenue),
    shareLabel: formatReportShare(product.revenueShare, REPORT_DIGITS.PRECISE_SHARE),
    cumulativeBar: [
      { value: toReportNumber(product.cumulativeShare), tone: ABC_CLASS_META[abcClass].tone },
    ],
    cumulativeLabel: formatReportShare(product.cumulativeShare),
    unitsLabel: `${formatReportCount(product.unitsSold)} ${PRODUCT_REPORT_TEXTS.UNITS_SUFFIX}`,
    ordersLabel: formatReportCount(product.ordersCount),
  };
};

const buildTrendChange = (trend: ProductTrendApi, kind: ProductTrendKind): ChangeBadgeData =>
  buildPercentChange(trend.revenueChangePercent) ?? {
    label: PRODUCT_REPORT_TEXTS.NEW_PRODUCT_LABEL,
    direction: kind === 'growing' ? 'up' : 'down',
    tone: kind === 'growing' ? 'success' : 'danger',
  };

const mapTrendRows = (
  trends: ProductTrendApi[] | null | undefined,
  kind: ProductTrendKind,
): ProductTrendRow[] =>
  (trends ?? []).map((trend) => ({
    productId: trend.productId?.trim() ?? '',
    name: trend.name?.trim() || EMPTY_VALUE_PLACEHOLDER,
    revenue: formatReportMoney(trend.revenue),
    change: buildTrendChange(trend, kind),
  }));

const buildTrends = (report: ProductReportApi): ProductTrendList[] => [
  {
    kind: 'growing',
    title: PRODUCT_REPORT_TEXTS.GROWING_TITLE,
    icon: PRODUCT_REPORT_ICONS.GROWING,
    emptyText: PRODUCT_REPORT_TEXTS.GROWING_EMPTY,
    rows: mapTrendRows(report.growing, 'growing'),
  },
  {
    kind: 'declining',
    title: PRODUCT_REPORT_TEXTS.DECLINING_TITLE,
    icon: PRODUCT_REPORT_ICONS.DECLINING,
    emptyText: PRODUCT_REPORT_TEXTS.DECLINING_EMPTY,
    rows: mapTrendRows(report.declining, 'declining'),
  },
];

const buildDeadStock = (
  deadStock: DeadStockApi | null | undefined,
  fallbackDays: number,
  now: Date,
): DeadStockView => ({
  days: Math.round(toReportNumber(deadStock?.days)) || fallbackDays,
  total: Math.round(toReportNumber(deadStock?.total)),
  rows: (deadStock?.items ?? []).map((item) => {
    const days = daysSince(item.lastSoldAt, now);
    return {
      productId: item.productId?.trim() ?? '',
      name: item.name?.trim() || EMPTY_VALUE_PLACEHOLDER,
      price: formatReportMoney(item.price),
      lastSoldLabel:
        formatReportDateTime(item.lastSoldAt) ?? PRODUCT_REPORT_TEXTS.DEAD_STOCK_NEVER_SOLD,
      daysLabel: days === null ? EMPTY_VALUE_PLACEHOLDER : formatReportCount(days),
    };
  }),
});

export const buildProductReportView = (
  report: ProductReportApi | null | undefined,
  fallbackDeadStockDays: number,
  now: Date = new Date(),
): ProductReportView | null => {
  if (!report) {
    return null;
  }

  const abcClasses = buildAbcClasses(report.abcSummary);

  return {
    productsSold: Math.round(toReportNumber(report.productsSold)),
    insights: mapReportInsights(report.insights),
    abcClasses,
    abcSegments: abcClasses.map((item) => {
      const share = findRevenueShare(report.abcSummary, item.abcClass);
      return {
        value: share,
        tone: item.tone,
        label: `${item.abcClass}${REPORT_LIST_SEPARATOR}${formatReportShare(share)}`,
      };
    }),
    abcAriaLabel: `${PRODUCT_REPORT_TEXTS.ABC_ARIA_PREFIX} ${abcClasses
      .map(
        (item) =>
          `${item.abcClass} ${formatReportShare(findRevenueShare(report.abcSummary, item.abcClass))}`,
      )
      .join(', ')}`,
    topProducts: (report.topProducts ?? []).map(mapTopProduct),
    trends: buildTrends(report),
    deadStock: buildDeadStock(report.deadStock, fallbackDeadStockDays, now),
  };
};

export const filterTopProducts = (rows: TopProductRow[], filter: AbcFilter): TopProductRow[] =>
  filter === 'all' ? rows : rows.filter((row) => row.abcClass === filter);

/** «Усі / Клас A / B / C» tabs with counts of the shown rows. */
export const buildAbcFilterTabs = (rows: TopProductRow[]): TabItem[] => [
  {
    value: 'all',
    label: PRODUCT_REPORT_TEXTS.TOP_FILTER_ALL,
    countLabel: formatReportCount(rows.length),
  },
  ...ABC_CLASSES.map((abcClass) => ({
    value: abcClass,
    label: `${PRODUCT_REPORT_TEXTS.TOP_FILTER_CLASS_PREFIX} ${abcClass}`,
    countLabel: formatReportCount(filterTopProducts(rows, abcClass).length),
  })),
];

export const isAbcFilter = (value: string): value is AbcFilter =>
  value === 'all' || ABC_CLASSES.some((abcClass) => abcClass === value);
