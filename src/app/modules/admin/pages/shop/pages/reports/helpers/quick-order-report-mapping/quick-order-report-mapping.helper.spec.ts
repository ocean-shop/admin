import { QUICK_ORDER_REPORT_TEXTS } from '../../constants/quick-order-report.constants';
import { QuickOrderReportApi } from '../../models/quick-order-report-api.model';
import { buildQuickOrderReportView } from './quick-order-report-mapping.helper';

const report: QuickOrderReportApi = {
  period: { from: '2026-11-01', to: '2026-11-27', days: 27 },
  previousPeriod: { from: '2026-10-05', to: '2026-10-31', days: 27 },
  valueSource: 'current_product_price',
  summary: {
    totalCount: 10,
    newCount: 3,
    processedCount: 5,
    cancelledCount: 2,
    estimatedValue: 8000,
    estimatedProcessedValue: 5000,
    estimatedCancelledValue: 1500,
    processedRate: 0.5,
    cancellationRate: 0.2,
  },
  previousSummary: {
    totalCount: 8,
    newCount: 2,
    processedCount: 5,
    cancelledCount: 1,
    estimatedValue: 6000,
    cancellationRate: 0.125,
  },
  changes: { totalCount: 25, processedCount: 0, newCount: 50, estimatedValue: 33.3 },
  topProducts: [
    {
      productId: ' p-1 ',
      name: ' Iphone ',
      slug: 'iphone',
      currentPrice: 1000,
      requestsCount: 4,
      estimatedValue: 4000,
    },
    { productId: null, name: '  ', slug: 'case', requestsCount: 2 },
    { requestsCount: 1 },
  ],
};

describe('buildQuickOrderReportView', () => {
  it('returns null without a report', () => {
    expect(buildQuickOrderReportView(null)).toBeNull();
    expect(buildQuickOrderReportView(undefined)).toBeNull();
  });

  it('maps KPIs with changes and previous values', () => {
    const view = buildQuickOrderReportView(report)!;

    expect(view.previousRangeLabel).toBe('05.10 – 31.10.2026');
    expect(view.kpis.map((kpi) => kpi.id)).toEqual([
      'totalCount',
      'processedCount',
      'newCount',
      'estimatedValue',
    ]);
    expect(view.kpis[0]).toMatchObject({
      value: '10',
      previous: `${QUICK_ORDER_REPORT_TEXTS.PREVIOUS_PREFIX} 8`,
      change: { label: '+25,0%', tone: 'success' },
    });
    expect(view.kpis[1].hint).toBe(`50% ${QUICK_ORDER_REPORT_TEXTS.KPI_PROCESSED_HINT_SUFFIX}`);
    expect(view.kpis[1].change?.tone).toBe('neutral');
    expect(view.kpis[2].change).toMatchObject({ direction: 'up', tone: 'danger' });
    expect(view.kpis[3].value).toBe(`${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 8 000 ₴`);
  });

  it('builds pending and cancelled highlights', () => {
    const [pending, cancelled] = buildQuickOrderReportView(report)!.highlights;

    expect(pending).toMatchObject({
      tone: 'warning',
      value: '3 заявки',
      description: `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 3 000 ₴ ${QUICK_ORDER_REPORT_TEXTS.PENDING_DESCRIPTION_SUFFIX}`,
      previous: `${QUICK_ORDER_REPORT_TEXTS.PREVIOUS_PREFIX} 2 заявки`,
      change: { tone: 'danger' },
    });
    expect(cancelled).toMatchObject({
      tone: 'danger',
      value: `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 1 500 ₴`,
      description: `2 заявки · 20,0% ${QUICK_ORDER_REPORT_TEXTS.CANCELLED_DESCRIPTION_SUFFIX}`,
      change: { label: '+7,5 п.п.', tone: 'danger' },
      previous: `${QUICK_ORDER_REPORT_TEXTS.PREVIOUS_PREFIX} 12,5%`,
    });
  });

  it('splits requests by status', () => {
    const { statusSplit } = buildQuickOrderReportView(report)!;

    expect(statusSplit.description).toBe(
      `${QUICK_ORDER_REPORT_TEXTS.STATUS_DESCRIPTION_PREFIX} 10 заявок ${QUICK_ORDER_REPORT_TEXTS.STATUS_DESCRIPTION_SUFFIX}`,
    );
    expect(statusSplit.segments.map((segment) => segment.value)).toEqual([0.5, 0.3, 0.2]);
    expect(statusSplit.segments.map((segment) => segment.tone)).toEqual([
      'primary',
      'secondary',
      'warning',
    ]);
    expect(statusSplit.ariaLabel).toBe(
      `${QUICK_ORDER_REPORT_TEXTS.STATUS_PROCESSED} · 50%, ${QUICK_ORDER_REPORT_TEXTS.STATUS_NEW} · 30%, ${QUICK_ORDER_REPORT_TEXTS.STATUS_CANCELLED} · 20%`,
    );
    expect(statusSplit.metrics.map((metric) => [metric.value, metric.caption])).toEqual([
      ['5 заявок', `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 5 000 ₴`],
      ['3 заявки', `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 3 000 ₴`],
      ['2 заявки', `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 1 500 ₴`],
    ]);
  });

  it('maps top products with shares of not cancelled requests and fallbacks', () => {
    const view = buildQuickOrderReportView(report)!;

    expect(view.productsCaption).toBe(
      `${QUICK_ORDER_REPORT_TEXTS.PRODUCTS_CAPTION_PREFIX} 3 товари`,
    );
    expect(view.products[0]).toEqual({
      productId: 'p-1',
      rank: 1,
      name: 'Iphone',
      requestsLabel: '4',
      shareLabel: '50%',
      shareBar: [{ value: 0.5, tone: 'primary' }],
      price: '1 000 ₴',
      estimatedValue: `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 4 000 ₴`,
    });
    expect(view.products[1]).toMatchObject({ productId: '', rank: 2, name: 'case' });
    expect(view.products[2]).toMatchObject({ name: '', price: '0 ₴', rank: 3 });
  });

  it('falls back to zeros for an empty report', () => {
    const view = buildQuickOrderReportView({})!;

    expect(view.previousRangeLabel).toBe('');
    expect(view.kpis.every((kpi) => kpi.change === null)).toBe(true);
    expect(view.highlights[1].change?.tone).toBe('neutral');
    expect(view.statusSplit.segments.every((segment) => segment.value === 0)).toBe(true);
    expect(view.statusSplit.metrics[1].caption).toBe(
      `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 0 ₴`,
    );
    expect(view.products).toEqual([]);
  });

  it('never reports a negative value for new requests', () => {
    const view = buildQuickOrderReportView({
      summary: { estimatedValue: 100, estimatedProcessedValue: 300, totalCount: 1 },
      topProducts: [{ requestsCount: 1 }],
    })!;

    expect(view.statusSplit.metrics[1].caption).toBe(
      `${QUICK_ORDER_REPORT_TEXTS.ESTIMATE_PREFIX} 0 ₴`,
    );
    expect(view.products[0].shareLabel).toBe('100%');
  });
});
