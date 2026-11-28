import { ORDER_PAYMENT_METHOD_LABELS } from '../../../orders/constants/orders.constants';
import { OrderPaymentMethod } from '../../../orders/models/order-payment-method.enum';
import { REVENUE_REPORT_TEXTS } from '../../constants/revenue-report.constants';
import { RevenueReportApi } from '../../models/revenue-report-api.model';
import {
  buildRevenueChartData,
  buildRevenueReportView,
  resolveReportGranularity,
} from './revenue-report-mapping.helper';

const report: RevenueReportApi = {
  period: { from: '2026-11-01', to: '2026-11-27', days: 27 },
  previousPeriod: { from: '2026-10-05', to: '2026-10-31', days: 27 },
  granularity: 'day',
  summary: {
    ordersCount: 171,
    grossSales: 241600,
    discounts: 22000,
    netSales: 219600,
    averageOrderValue: 1284,
    codInTransit: 38450,
    cancelledCount: 18,
    cancelledAmount: 21870,
    cancellationRate: 0.084,
  },
  previousSummary: {
    grossSales: 230100,
    discounts: 16300,
    netSales: 213800,
    averageOrderValue: 1146,
    codInTransit: 29900,
    cancellationRate: 0.051,
  },
  changes: {
    grossSales: 5,
    discounts: 35,
    netSales: 2.7,
    averageOrderValue: 12,
    codInTransit: 28.6,
  },
  byPaymentMethod: [{ key: 'card', ordersCount: 98, netSales: 131760, share: 0.6 }],
  byShippingMethod: [{ key: 'pickup', ordersCount: 12, netSales: 15380, share: 0.07 }],
  timeline: [
    { period: '2026-11-01', ordersCount: 5, netSales: 6100, paidRevenue: 5000 },
    { period: null, netSales: 1 },
    { period: '2026-11-02', netSales: null, paidRevenue: null },
  ],
  insights: [{ code: 'net_sales_growth', severity: 'positive', message: 'Ростемо' }],
};

describe('revenue-report-mapping helper', () => {
  it('resolves granularity with a fallback', () => {
    expect(resolveReportGranularity('week')).toBe('week');
    expect(resolveReportGranularity('year')).toBe('day');
    expect(resolveReportGranularity(null)).toBe('day');
  });

  it('returns null without a report', () => {
    expect(buildRevenueReportView(undefined)).toBeNull();
    expect(buildRevenueReportView(null)).toBeNull();
  });

  it('maps period labels and the chart total', () => {
    const view = buildRevenueReportView(report);

    expect(view?.granularity).toBe('day');
    expect(view?.currentRangeLabel).toBe('01.11 – 27.11.2026');
    expect(view?.previousRangeLabel).toBe('05.10 – 31.10.2026');
    expect(view?.totalLabel).toBe('Разом 219 600 ₴ за 171 замовлення');
  });

  it('maps KPIs with changes and previous values', () => {
    const kpis = buildRevenueReportView(report)?.kpis ?? [];

    expect(kpis.map((kpi) => kpi.value)).toEqual(['241 600 ₴', '22 000 ₴', '219 600 ₴', '1 284 ₴']);
    expect(kpis[0]).toEqual({
      id: 'grossSales',
      label: REVENUE_REPORT_TEXTS.KPI_GROSS_SALES,
      hint: REVENUE_REPORT_TEXTS.KPI_GROSS_SALES_HINT,
      value: '241 600 ₴',
      change: { label: '+5,0%', direction: 'up', tone: 'success' },
      previous: 'було 230 100 ₴',
    });
    expect(kpis[1].change?.tone).toBe('danger');
    expect(kpis[3].hint).toBe(`${REVENUE_REPORT_TEXTS.KPI_AOV_HINT_PREFIX} 171 замовлення`);
  });

  it('maps money on the road and cancellation losses', () => {
    const [cod, cancelled] = buildRevenueReportView(report)?.highlights ?? [];

    expect(cod.value).toBe('38 450 ₴');
    expect(cod.change).toEqual({ label: '+28,6%', direction: 'up', tone: 'danger' });
    expect(cod.previous).toBe('було 29 900 ₴');
    expect(cancelled.value).toBe('21 870 ₴');
    expect(cancelled.description).toBe(
      `18 замовлень · 8,4% ${REVENUE_REPORT_TEXTS.CANCELLED_DESCRIPTION_SUFFIX}`,
    );
    expect(cancelled.change).toEqual({ label: '+3,3 п.п.', direction: 'up', tone: 'danger' });
    expect(cancelled.previous).toBe('було 5,1%');
  });

  it('maps breakdowns with translated method names', () => {
    const [payment, shipping] = buildRevenueReportView(report)?.breakdowns ?? [];

    expect(payment.rows).toEqual([
      {
        key: 'card',
        name: ORDER_PAYMENT_METHOD_LABELS[OrderPaymentMethod.Card],
        amount: '131 760 ₴',
        metaLabel: '60% · 98 замовлень',
        bar: [{ value: 0.6, tone: 'primary' }],
      },
    ]);
    expect(shipping.rows[0].name).toBe('Pickup');
  });

  it('maps insights', () => {
    expect(buildRevenueReportView(report)?.insights.map((insight) => insight.message)).toEqual([
      'Ростемо',
    ]);
  });

  it('builds chart data and skips points without a period', () => {
    expect(buildRevenueChartData(report.timeline, 'day')).toEqual({
      categories: ['01.11', '02.11'],
      netSales: [6100, 0],
      paidRevenue: [5000, 0],
    });
    expect(buildRevenueChartData([{ period: '2026-11-01' }], 'month').categories).toEqual([
      '11.2026',
    ]);
    expect(buildRevenueChartData(null, 'week')).toEqual({
      categories: [],
      netSales: [],
      paidRevenue: [],
    });
  });

  it('falls back to empty sections when the API omits them', () => {
    const view = buildRevenueReportView({});

    expect(view?.kpis[0].value).toBe('0 ₴');
    expect(view?.kpis[0].change).toBeNull();
    expect(view?.currentRangeLabel).toBe('');
    expect(view?.breakdowns.every((breakdown) => breakdown.rows.length === 0)).toBe(true);
    expect(view?.insights).toEqual([]);
    expect(view?.chart.categories).toEqual([]);
  });

  it('trims breakdown keys', () => {
    const view = buildRevenueReportView({ byPaymentMethod: [{ key: null }] });

    expect(view?.breakdowns[0].rows[0].key).toBe('');
  });
});
