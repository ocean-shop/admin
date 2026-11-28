import {
  CUSTOMER_REPORT_TEXTS,
  CUSTOMER_SEGMENT_META,
  CUSTOMER_SEGMENTS,
} from '../../constants/customer-report.constants';
import { CustomerReportApi } from '../../models/customer-report-api.model';
import { buildCustomerReportView } from './customer-report-mapping.helper';

const report: CustomerReportApi = {
  period: { from: '2026-11-01', to: '2026-11-27' },
  summary: {
    totalCustomers: 640,
    repeatCustomers: 46,
    repeatRate: 0.29,
    guestCustomers: 120,
    averageLtv: 2940,
    averageOrdersPerCustomer: 2.34,
    activeCustomers: 158,
    newCustomers: 112,
    returningCustomers: 46,
    periodRevenue: 219600,
    returningRevenue: 90040,
    returningRevenueShare: 0.41,
  },
  segments: [
    { segment: 'champions', customersCount: 38, revenue: 74000, customersShare: 0.06 },
    { segment: 'unknown', customersCount: 1 },
  ],
  insights: [{ code: 'low_repeat_rate', severity: 'warning', message: 'Мало повторних' }],
};

describe('buildCustomerReportView', () => {
  it('returns null without a report', () => {
    expect(buildCustomerReportView(undefined)).toBeNull();
  });

  it('maps KPIs without comparison', () => {
    const kpis = buildCustomerReportView(report)?.kpis ?? [];

    expect(kpis.map((kpi) => kpi.value)).toEqual(['158', '29%', '2 940 ₴', '41%', '640', '2,3']);
    expect(kpis[1].hint).toBe(`46 клієнтів ${CUSTOMER_REPORT_TEXTS.KPI_REPEAT_RATE_HINT_SUFFIX}`);
    expect(kpis[3].hint).toBe('90 040 ₴ з 219 600 ₴');
    expect(kpis[4].hint).toBe(`120 ${CUSTOMER_REPORT_TEXTS.KPI_TOTAL_HINT_SUFFIX}`);
    expect(kpis.every((kpi) => kpi.change === null && kpi.previous === '')).toBe(true);
  });

  it('splits period revenue between new and returning customers', () => {
    const split = buildCustomerReportView(report)?.split;

    expect(split?.description).toBe('Чиста виручка 219 600 ₴ за період');
    expect(split?.segments.map((segment) => Number(segment.value.toFixed(2)))).toEqual([
      0.59, 0.41,
    ]);
    expect(split?.ariaLabel).toBe('Нові покупці · 59%, Повторні покупці · 41%');
    expect(split?.metrics).toEqual([
      {
        id: 'new',
        label: CUSTOMER_REPORT_TEXTS.SPLIT_NEW,
        value: '129 560 ₴',
        caption: '112 клієнтів',
      },
      {
        id: 'returning',
        label: CUSTOMER_REPORT_TEXTS.SPLIT_RETURNING,
        value: '90 040 ₴',
        caption: '46 клієнтів',
      },
    ]);
  });

  it('keeps an empty split when there is no revenue', () => {
    const split = buildCustomerReportView({ summary: { returningRevenue: 10 } })?.split;

    expect(split?.segments.map((segment) => segment.value)).toEqual([0, 0]);
    expect(split?.metrics.map((metric) => metric.value)).toEqual(['0 ₴', '0 ₴']);
  });

  it('lists every known segment in order with fallbacks', () => {
    const view = buildCustomerReportView(report);

    expect(view?.segments.map((segment) => segment.segment)).toEqual([...CUSTOMER_SEGMENTS]);
    expect(view?.segments[0]).toEqual({
      segment: 'champions',
      ...CUSTOMER_SEGMENT_META.champions,
      countLabel: '38',
      detailsLabel: `6% ${CUSTOMER_REPORT_TEXTS.SEGMENT_CUSTOMERS_SHARE_SUFFIX} · 74 000 ₴ ${CUSTOMER_REPORT_TEXTS.SEGMENT_REVENUE_SUFFIX}`,
    });
    expect(view?.segments[1].countLabel).toBe('0');
    expect(view?.segmentsDescription).toBe(
      `640 клієнтів ${CUSTOMER_REPORT_TEXTS.SEGMENTS_DESCRIPTION_SUFFIX}`,
    );
  });

  it('maps insights and tolerates a missing summary', () => {
    const view = buildCustomerReportView({ insights: report.insights });

    expect(view?.insights[0].message).toBe('Мало повторних');
    expect(view?.kpis[0].value).toBe('0');
    expect(view?.segments).toHaveLength(CUSTOMER_SEGMENTS.length);
  });
});
