import {
  CUSTOMER_REPORT_TEXTS,
  CUSTOMER_SEGMENT_META,
  CUSTOMER_SEGMENTS,
} from '../../constants/customer-report.constants';
import { REPORT_COUNT_WORDS, REPORT_LIST_SEPARATOR } from '../../constants/report-format.constants';
import {
  CustomerReportApi,
  CustomerSegmentSummaryApi,
  CustomerSummaryApi,
} from '../../models/customer-report-api.model';
import {
  CustomerReportView,
  CustomerSegmentView,
  CustomerSplitView,
} from '../../models/customer-report-view.model';
import { ReportKpi } from '../../models/report-kpi.model';
import {
  formatReportCount,
  formatReportCountWithWord,
  formatReportDecimal,
  formatReportMoney,
  formatReportShare,
  toReportNumber,
} from '../report-format/report-format.helper';
import { mapReportInsights } from '../report-insights/report-insights.helper';

const buildKpi = (id: string, label: string, value: string, hint: string): ReportKpi => ({
  id,
  label,
  value,
  hint,
  change: null,
  previous: '',
});

const buildKpis = (summary: CustomerSummaryApi): ReportKpi[] => [
  buildKpi(
    'activeCustomers',
    CUSTOMER_REPORT_TEXTS.KPI_ACTIVE,
    formatReportCount(summary.activeCustomers),
    CUSTOMER_REPORT_TEXTS.KPI_ACTIVE_HINT,
  ),
  buildKpi(
    'repeatRate',
    CUSTOMER_REPORT_TEXTS.KPI_REPEAT_RATE,
    formatReportShare(summary.repeatRate),
    `${formatReportCountWithWord(summary.repeatCustomers, REPORT_COUNT_WORDS.CUSTOMERS)} ${CUSTOMER_REPORT_TEXTS.KPI_REPEAT_RATE_HINT_SUFFIX}`,
  ),
  buildKpi(
    'averageLtv',
    CUSTOMER_REPORT_TEXTS.KPI_LTV,
    formatReportMoney(summary.averageLtv),
    CUSTOMER_REPORT_TEXTS.KPI_LTV_HINT,
  ),
  buildKpi(
    'returningRevenueShare',
    CUSTOMER_REPORT_TEXTS.KPI_RETURNING_SHARE,
    formatReportShare(summary.returningRevenueShare),
    [
      formatReportMoney(summary.returningRevenue),
      CUSTOMER_REPORT_TEXTS.KPI_RETURNING_SHARE_JOINER,
      formatReportMoney(summary.periodRevenue),
    ].join(' '),
  ),
  buildKpi(
    'totalCustomers',
    CUSTOMER_REPORT_TEXTS.KPI_TOTAL,
    formatReportCount(summary.totalCustomers),
    `${formatReportCount(summary.guestCustomers)} ${CUSTOMER_REPORT_TEXTS.KPI_TOTAL_HINT_SUFFIX}`,
  ),
  buildKpi(
    'averageOrdersPerCustomer',
    CUSTOMER_REPORT_TEXTS.KPI_ORDERS_PER_CUSTOMER,
    formatReportDecimal(summary.averageOrdersPerCustomer),
    CUSTOMER_REPORT_TEXTS.KPI_ORDERS_PER_CUSTOMER_HINT,
  ),
];

const buildSplit = (summary: CustomerSummaryApi): CustomerSplitView => {
  const periodRevenue = toReportNumber(summary.periodRevenue);
  const returningRevenue = Math.min(toReportNumber(summary.returningRevenue), periodRevenue);
  const newRevenue = periodRevenue - returningRevenue;
  const returningShare = periodRevenue ? returningRevenue / periodRevenue : 0;
  const newShare = periodRevenue ? 1 - returningShare : 0;
  const newLabel = `${CUSTOMER_REPORT_TEXTS.SPLIT_NEW}${REPORT_LIST_SEPARATOR}${formatReportShare(newShare)}`;
  const returningLabel = `${CUSTOMER_REPORT_TEXTS.SPLIT_RETURNING}${REPORT_LIST_SEPARATOR}${formatReportShare(returningShare)}`;

  return {
    description: [
      CUSTOMER_REPORT_TEXTS.SPLIT_DESCRIPTION_PREFIX,
      formatReportMoney(periodRevenue),
      CUSTOMER_REPORT_TEXTS.SPLIT_DESCRIPTION_SUFFIX,
    ].join(' '),
    segments: [
      { value: newShare, tone: 'primary', label: newLabel },
      { value: returningShare, tone: 'secondary', label: returningLabel },
    ],
    ariaLabel: `${newLabel}, ${returningLabel}`,
    metrics: [
      {
        id: 'new',
        label: CUSTOMER_REPORT_TEXTS.SPLIT_NEW,
        value: formatReportMoney(newRevenue),
        caption: formatReportCountWithWord(summary.newCustomers, REPORT_COUNT_WORDS.CUSTOMERS),
      },
      {
        id: 'returning',
        label: CUSTOMER_REPORT_TEXTS.SPLIT_RETURNING,
        value: formatReportMoney(returningRevenue),
        caption: formatReportCountWithWord(
          summary.returningCustomers,
          REPORT_COUNT_WORDS.CUSTOMERS,
        ),
      },
    ],
  };
};

/** Every known segment in a fixed order; segments missing from the API count as empty. */
const buildSegments = (
  segments: CustomerSegmentSummaryApi[] | null | undefined,
): CustomerSegmentView[] =>
  CUSTOMER_SEGMENTS.map((segment) => {
    const item = (segments ?? []).find((entry) => entry.segment === segment);
    const meta = CUSTOMER_SEGMENT_META[segment];

    return {
      segment,
      title: meta.title,
      icon: meta.icon,
      tone: meta.tone,
      description: meta.description,
      countLabel: formatReportCount(item?.customersCount),
      detailsLabel: [
        `${formatReportShare(item?.customersShare)} ${CUSTOMER_REPORT_TEXTS.SEGMENT_CUSTOMERS_SHARE_SUFFIX}`,
        `${formatReportMoney(item?.revenue)} ${CUSTOMER_REPORT_TEXTS.SEGMENT_REVENUE_SUFFIX}`,
      ].join(REPORT_LIST_SEPARATOR),
    };
  });

export const buildCustomerReportView = (
  report: CustomerReportApi | null | undefined,
): CustomerReportView | null => {
  if (!report) {
    return null;
  }

  const summary = report.summary ?? {};

  return {
    insights: mapReportInsights(report.insights),
    kpis: buildKpis(summary),
    split: buildSplit(summary),
    segmentsDescription: `${formatReportCountWithWord(summary.totalCustomers, REPORT_COUNT_WORDS.CUSTOMERS)} ${CUSTOMER_REPORT_TEXTS.SEGMENTS_DESCRIPTION_SUFFIX}`,
    segments: buildSegments(report.segments),
  };
};
