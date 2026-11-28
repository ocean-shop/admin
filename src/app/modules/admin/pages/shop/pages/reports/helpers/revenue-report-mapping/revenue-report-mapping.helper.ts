import {
  formatOrderPaymentMethodLabel,
  formatOrderShippingMethodLabel,
} from '../../../orders/helpers/order-mapping/order-mapping.helper';
import {
  REPORT_COUNT_WORDS,
  REPORT_DIGITS,
  REPORT_LIST_SEPARATOR,
} from '../../constants/report-format.constants';
import {
  REVENUE_DEFAULT_GRANULARITY,
  REVENUE_GRANULARITIES,
  REVENUE_REPORT_ICONS,
  REVENUE_REPORT_TEXTS,
} from '../../constants/revenue-report.constants';
import { ReportGranularity } from '../../models/report-granularity.type';
import { ReportKpi } from '../../models/report-kpi.model';
import {
  RevenueBreakdownApiItem,
  RevenueChangesApi,
  RevenueReportApi,
  RevenueSummaryApi,
  RevenueTimelineApiPoint,
} from '../../models/revenue-report-api.model';
import {
  RevenueBreakdown,
  RevenueBreakdownRow,
  RevenueChartData,
  RevenueHighlight,
  RevenueReportView,
} from '../../models/revenue-report-view.model';
import {
  buildPercentChange,
  buildPointsChange,
  formatReportCountWithWord,
  formatReportMoney,
  formatReportShare,
  toReportNumber,
} from '../report-format/report-format.helper';
import { mapReportInsights } from '../report-insights/report-insights.helper';
import {
  formatReportMonth,
  formatReportPeriodRange,
  formatReportShortDate,
} from '../report-period/report-period.helper';

export const resolveReportGranularity = (value: string | null | undefined): ReportGranularity =>
  REVENUE_GRANULARITIES.find((granularity) => granularity === value) ?? REVENUE_DEFAULT_GRANULARITY;

const formatPrevious = (value: string): string =>
  `${REVENUE_REPORT_TEXTS.PREVIOUS_PREFIX} ${value}`;

const buildMoneyKpi = (
  id: keyof RevenueSummaryApi,
  label: string,
  hint: string,
  summary: RevenueSummaryApi,
  previous: RevenueSummaryApi,
  changes: RevenueChangesApi,
  higherIsBetter = true,
): ReportKpi => ({
  id,
  label,
  hint,
  value: formatReportMoney(summary[id]),
  change: buildPercentChange(changes[id], higherIsBetter),
  previous: formatPrevious(formatReportMoney(previous[id])),
});

const buildKpis = (
  summary: RevenueSummaryApi,
  previous: RevenueSummaryApi,
  changes: RevenueChangesApi,
): ReportKpi[] => [
  buildMoneyKpi(
    'grossSales',
    REVENUE_REPORT_TEXTS.KPI_GROSS_SALES,
    REVENUE_REPORT_TEXTS.KPI_GROSS_SALES_HINT,
    summary,
    previous,
    changes,
  ),
  buildMoneyKpi(
    'discounts',
    REVENUE_REPORT_TEXTS.KPI_DISCOUNTS,
    REVENUE_REPORT_TEXTS.KPI_DISCOUNTS_HINT,
    summary,
    previous,
    changes,
    false,
  ),
  buildMoneyKpi(
    'netSales',
    REVENUE_REPORT_TEXTS.KPI_NET_SALES,
    REVENUE_REPORT_TEXTS.KPI_NET_SALES_HINT,
    summary,
    previous,
    changes,
  ),
  buildMoneyKpi(
    'averageOrderValue',
    REVENUE_REPORT_TEXTS.KPI_AOV,
    `${REVENUE_REPORT_TEXTS.KPI_AOV_HINT_PREFIX} ${formatReportCountWithWord(summary.ordersCount, REPORT_COUNT_WORDS.ORDERS)}`,
    summary,
    previous,
    changes,
  ),
];

const buildHighlights = (
  summary: RevenueSummaryApi,
  previous: RevenueSummaryApi,
  changes: RevenueChangesApi,
): RevenueHighlight[] => [
  {
    id: 'codInTransit',
    icon: REVENUE_REPORT_ICONS.COD,
    tone: 'warning',
    title: REVENUE_REPORT_TEXTS.COD_TITLE,
    value: formatReportMoney(summary.codInTransit),
    description: REVENUE_REPORT_TEXTS.COD_DESCRIPTION,
    change: buildPercentChange(changes.codInTransit, false),
    previous: formatPrevious(formatReportMoney(previous.codInTransit)),
    linkLabel: REVENUE_REPORT_TEXTS.COD_LINK,
  },
  {
    id: 'cancelled',
    icon: REVENUE_REPORT_ICONS.CANCELLED,
    tone: 'danger',
    title: REVENUE_REPORT_TEXTS.CANCELLED_TITLE,
    value: formatReportMoney(summary.cancelledAmount),
    description: [
      formatReportCountWithWord(summary.cancelledCount, REPORT_COUNT_WORDS.ORDERS),
      `${formatReportShare(summary.cancellationRate, REPORT_DIGITS.PRECISE_SHARE)} ${REVENUE_REPORT_TEXTS.CANCELLED_DESCRIPTION_SUFFIX}`,
    ].join(REPORT_LIST_SEPARATOR),
    change: buildPointsChange(summary.cancellationRate, previous.cancellationRate, false),
    previous: formatPrevious(
      formatReportShare(previous.cancellationRate, REPORT_DIGITS.PRECISE_SHARE),
    ),
    linkLabel: REVENUE_REPORT_TEXTS.CANCELLED_LINK,
  },
];

const mapBreakdownRows = (
  items: RevenueBreakdownApiItem[] | null | undefined,
  formatName: (key: string) => string,
): RevenueBreakdownRow[] =>
  (items ?? []).map((item) => {
    const key = item.key?.trim() ?? '';
    return {
      key,
      name: formatName(key),
      amount: formatReportMoney(item.netSales),
      metaLabel: [
        formatReportShare(item.share),
        formatReportCountWithWord(item.ordersCount, REPORT_COUNT_WORDS.ORDERS),
      ].join(REPORT_LIST_SEPARATOR),
      bar: [{ value: toReportNumber(item.share), tone: 'primary' }],
    };
  });

const buildBreakdowns = (report: RevenueReportApi): RevenueBreakdown[] => [
  {
    id: 'payment',
    title: REVENUE_REPORT_TEXTS.BY_PAYMENT_TITLE,
    icon: REVENUE_REPORT_ICONS.BY_PAYMENT,
    rows: mapBreakdownRows(report.byPaymentMethod, formatOrderPaymentMethodLabel),
  },
  {
    id: 'shipping',
    title: REVENUE_REPORT_TEXTS.BY_SHIPPING_TITLE,
    icon: REVENUE_REPORT_ICONS.BY_SHIPPING,
    rows: mapBreakdownRows(report.byShippingMethod, formatOrderShippingMethodLabel),
  },
];

const formatTimelineLabel = (period: string, granularity: ReportGranularity): string =>
  granularity === 'month' ? formatReportMonth(period) : formatReportShortDate(period);

export const buildRevenueChartData = (
  timeline: RevenueTimelineApiPoint[] | null | undefined,
  granularity: ReportGranularity,
): RevenueChartData => {
  const points = (timeline ?? []).filter((point) => Boolean(point.period));

  return {
    categories: points.map((point) => formatTimelineLabel(point.period ?? '', granularity)),
    netSales: points.map((point) => toReportNumber(point.netSales)),
    paidRevenue: points.map((point) => toReportNumber(point.paidRevenue)),
  };
};

export const buildRevenueReportView = (
  report: RevenueReportApi | null | undefined,
): RevenueReportView | null => {
  if (!report) {
    return null;
  }

  const summary = report.summary ?? {};
  const previous = report.previousSummary ?? {};
  const changes = report.changes ?? {};
  const granularity = resolveReportGranularity(report.granularity);

  return {
    granularity,
    currentRangeLabel: formatReportPeriodRange(report.period),
    previousRangeLabel: formatReportPeriodRange(report.previousPeriod),
    totalLabel: [
      REVENUE_REPORT_TEXTS.CHART_TOTAL_PREFIX,
      formatReportMoney(summary.netSales),
      REVENUE_REPORT_TEXTS.CHART_TOTAL_JOINER,
      formatReportCountWithWord(summary.ordersCount, REPORT_COUNT_WORDS.ORDERS),
    ].join(' '),
    kpis: buildKpis(summary, previous, changes),
    highlights: buildHighlights(summary, previous, changes),
    chart: buildRevenueChartData(report.timeline, granularity),
    breakdowns: buildBreakdowns(report),
    insights: mapReportInsights(report.insights),
  };
};
