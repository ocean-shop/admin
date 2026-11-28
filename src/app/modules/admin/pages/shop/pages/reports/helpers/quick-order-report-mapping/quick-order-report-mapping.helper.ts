import {
  QUICK_ORDER_REPORT_ICONS,
  QUICK_ORDER_REPORT_TEXTS,
} from '../../constants/quick-order-report.constants';
import {
  REPORT_COUNT_WORDS,
  REPORT_DIGITS,
  REPORT_LIST_SEPARATOR,
} from '../../constants/report-format.constants';
import {
  QuickOrderChangesApi,
  QuickOrderProductApi,
  QuickOrderReportApi,
  QuickOrderSummaryApi,
} from '../../models/quick-order-report-api.model';
import {
  QuickOrderProductRow,
  QuickOrderReportView,
  QuickOrderStatusSplitView,
} from '../../models/quick-order-report-view.model';
import { ReportKpi } from '../../models/report-kpi.model';
import { RevenueHighlight } from '../../models/revenue-report-view.model';
import {
  buildPercentChange,
  buildPointsChange,
  formatReportCount,
  formatReportCountWithWord,
  formatReportMoney,
  formatReportShare,
  toReportNumber,
} from '../report-format/report-format.helper';
import { formatReportPeriodRange } from '../report-period/report-period.helper';

const formatPrevious = (value: string): string =>
  `${QUICK_ORDER_REPORT_TEXTS.PREVIOUS_PREFIX} ${value}`;

const formatEstimate = (value: number | null | undefined): string =>
  `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} ${formatReportMoney(value)}`;

const formatRequests = (value: number | null | undefined): string =>
  formatReportCountWithWord(value, REPORT_COUNT_WORDS.REQUESTS);

/** Value of requests still waiting for a call: not cancelled minus processed. */
const getNewValue = (summary: QuickOrderSummaryApi): number =>
  Math.max(
    0,
    toReportNumber(summary.estimatedValue) - toReportNumber(summary.estimatedProcessedValue),
  );

/** Share of `part` in `total`, 0 when there is nothing to divide by. */
const toShare = (part: number | null | undefined, total: number | null | undefined): number => {
  const whole = toReportNumber(total);
  return whole > 0 ? toReportNumber(part) / whole : 0;
};

const buildKpis = (
  summary: QuickOrderSummaryApi,
  previous: QuickOrderSummaryApi,
  changes: QuickOrderChangesApi,
): ReportKpi[] => [
  {
    id: 'totalCount',
    label: QUICK_ORDER_REPORT_TEXTS.KPI_TOTAL,
    value: formatReportCount(summary.totalCount),
    hint: QUICK_ORDER_REPORT_TEXTS.KPI_TOTAL_HINT,
    change: buildPercentChange(changes.totalCount),
    previous: formatPrevious(formatReportCount(previous.totalCount)),
  },
  {
    id: 'processedCount',
    label: QUICK_ORDER_REPORT_TEXTS.KPI_PROCESSED,
    value: formatReportCount(summary.processedCount),
    hint: `${formatReportShare(summary.processedRate)} ${QUICK_ORDER_REPORT_TEXTS.KPI_PROCESSED_HINT_SUFFIX}`,
    change: buildPercentChange(changes.processedCount),
    previous: formatPrevious(formatReportCount(previous.processedCount)),
  },
  {
    id: 'newCount',
    label: QUICK_ORDER_REPORT_TEXTS.KPI_NEW,
    value: formatReportCount(summary.newCount),
    hint: QUICK_ORDER_REPORT_TEXTS.KPI_NEW_HINT,
    change: buildPercentChange(changes.newCount, false),
    previous: formatPrevious(formatReportCount(previous.newCount)),
  },
  {
    id: 'estimatedValue',
    label: QUICK_ORDER_REPORT_TEXTS.KPI_VALUE,
    value: formatEstimate(summary.estimatedValue),
    hint: QUICK_ORDER_REPORT_TEXTS.KPI_VALUE_HINT,
    change: buildPercentChange(changes.estimatedValue),
    previous: formatPrevious(formatReportMoney(previous.estimatedValue)),
  },
];

const buildHighlights = (
  summary: QuickOrderSummaryApi,
  previous: QuickOrderSummaryApi,
  changes: QuickOrderChangesApi,
): RevenueHighlight[] => [
  {
    id: 'pending',
    icon: QUICK_ORDER_REPORT_ICONS.PENDING,
    tone: 'warning',
    title: QUICK_ORDER_REPORT_TEXTS.PENDING_TITLE,
    value: formatRequests(summary.newCount),
    description: `${formatEstimate(getNewValue(summary))} ${QUICK_ORDER_REPORT_TEXTS.PENDING_DESCRIPTION_SUFFIX}`,
    change: buildPercentChange(changes.newCount, false),
    previous: formatPrevious(formatRequests(previous.newCount)),
    linkLabel: QUICK_ORDER_REPORT_TEXTS.QUICK_ORDERS_LINK,
  },
  {
    id: 'cancelled',
    icon: QUICK_ORDER_REPORT_ICONS.CANCELLED,
    tone: 'danger',
    title: QUICK_ORDER_REPORT_TEXTS.CANCELLED_TITLE,
    value: formatEstimate(summary.estimatedCancelledValue),
    description: [
      formatRequests(summary.cancelledCount),
      `${formatReportShare(summary.cancellationRate, REPORT_DIGITS.PRECISE_SHARE)} ${QUICK_ORDER_REPORT_TEXTS.CANCELLED_DESCRIPTION_SUFFIX}`,
    ].join(REPORT_LIST_SEPARATOR),
    change: buildPointsChange(summary.cancellationRate, previous.cancellationRate, false),
    previous: formatPrevious(
      formatReportShare(previous.cancellationRate, REPORT_DIGITS.PRECISE_SHARE),
    ),
    linkLabel: QUICK_ORDER_REPORT_TEXTS.QUICK_ORDERS_LINK,
  },
];

const buildStatusSplit = (summary: QuickOrderSummaryApi): QuickOrderStatusSplitView => {
  const statuses = [
    {
      id: 'processed',
      label: QUICK_ORDER_REPORT_TEXTS.STATUS_PROCESSED,
      count: summary.processedCount,
      value: summary.estimatedProcessedValue,
      tone: 'primary',
    },
    {
      id: 'new',
      label: QUICK_ORDER_REPORT_TEXTS.STATUS_NEW,
      count: summary.newCount,
      value: getNewValue(summary),
      tone: 'secondary',
    },
    {
      id: 'cancelled',
      label: QUICK_ORDER_REPORT_TEXTS.STATUS_CANCELLED,
      count: summary.cancelledCount,
      value: summary.estimatedCancelledValue,
      tone: 'warning',
    },
  ] as const;

  const segments = statuses.map((status) => ({
    value: toShare(status.count, summary.totalCount),
    tone: status.tone,
    label: `${status.label}${REPORT_LIST_SEPARATOR}${formatReportShare(toShare(status.count, summary.totalCount))}`,
  }));

  return {
    description: [
      QUICK_ORDER_REPORT_TEXTS.STATUS_DESCRIPTION_PREFIX,
      formatRequests(summary.totalCount),
      QUICK_ORDER_REPORT_TEXTS.STATUS_DESCRIPTION_SUFFIX,
    ].join(' '),
    segments,
    ariaLabel: segments.map((segment) => segment.label).join(', '),
    metrics: statuses.map((status) => ({
      id: status.id,
      label: status.label,
      value: formatRequests(status.count),
      caption: formatEstimate(status.value),
    })),
  };
};

const buildProducts = (
  products: QuickOrderProductApi[] | null | undefined,
  summary: QuickOrderSummaryApi,
): QuickOrderProductRow[] => {
  const activeRequests =
    toReportNumber(summary.totalCount) - toReportNumber(summary.cancelledCount);

  return (products ?? []).map((product, index) => {
    const share = toShare(product.requestsCount, activeRequests);
    return {
      productId: product.productId?.trim() ?? '',
      rank: index + 1,
      name: product.name?.trim() || product.slug?.trim() || '',
      requestsLabel: formatReportCount(product.requestsCount),
      shareLabel: formatReportShare(share),
      shareBar: [{ value: share, tone: 'primary' }],
      price: formatReportMoney(product.currentPrice),
      estimatedValue: formatEstimate(product.estimatedValue),
    };
  });
};

export const buildQuickOrderReportView = (
  report: QuickOrderReportApi | null | undefined,
): QuickOrderReportView | null => {
  if (!report) {
    return null;
  }

  const summary = report.summary ?? {};
  const previous = report.previousSummary ?? {};
  const changes = report.changes ?? {};
  const products = buildProducts(report.topProducts, summary);

  return {
    previousRangeLabel: formatReportPeriodRange(report.previousPeriod),
    kpis: buildKpis(summary, previous, changes),
    highlights: buildHighlights(summary, previous, changes),
    statusSplit: buildStatusSplit(summary),
    products,
    productsCaption: `${QUICK_ORDER_REPORT_TEXTS.PRODUCTS_CAPTION_PREFIX} ${formatReportCountWithWord(products.length, REPORT_COUNT_WORDS.PRODUCTS)}`,
  };
};
