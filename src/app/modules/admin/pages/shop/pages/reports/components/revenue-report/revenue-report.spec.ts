import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Highcharts from 'highcharts';
import { NEVER, of, throwError } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { REPORTS_TEXTS } from '../../constants/reports.constants';
import {
  REVENUE_GRANULARITY_TITLES,
  REVENUE_REPORT_TEXTS,
} from '../../constants/revenue-report.constants';
import { RevenueReportQuery } from '../../models/report-query.model';
import { RevenueReportApi } from '../../models/revenue-report-api.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { RevenueReport } from './revenue-report';

const response: RevenueReportApi = {
  period: { from: '2026-11-01', to: '2026-11-27' },
  previousPeriod: { from: '2026-10-05', to: '2026-10-31' },
  granularity: 'week',
  summary: { netSales: 219600, ordersCount: 171, codInTransit: 38450 },
  previousSummary: { netSales: 213800 },
  changes: { netSales: 2.7, codInTransit: 28.6 },
  timeline: [{ period: '2026-11-02', netSales: 1000, paidRevenue: 900 }],
  byPaymentMethod: [{ key: 'card', netSales: 1000, share: 1, ordersCount: 2 }],
  insights: [{ code: 'net_sales_growth', severity: 'positive', message: 'Ростемо' }],
};

describe('RevenueReport', () => {
  let fixture: ComponentFixture<RevenueReport>;
  let element: HTMLElement;
  let mockService: { getRevenueReport: ReturnType<typeof vi.fn> };

  const calls = (): RevenueReportQuery[] =>
    mockService.getRevenueReport.mock.calls.map(([query]) => query as RevenueReportQuery);

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(RevenueReport);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    vi.spyOn(Highcharts, 'chart').mockReturnValue({
      update: vi.fn(),
      destroy: vi.fn(),
    } as unknown as Highcharts.Chart);
    mockService = { getRevenueReport: vi.fn().mockReturnValue(of(response)) };

    await TestBed.configureTestingModule({
      imports: [RevenueReport],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: FinanceReportsService, useValue: mockService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the report with auto step and renders sections', async () => {
    await create();

    expect(calls()).toEqual([{ shopId: 'shop-1', from: '2026-11-01', to: '2026-11-27' }]);
    expect(element.textContent).toContain('Ростемо');
    expect(element.querySelectorAll('app-stat-card')).toHaveLength(4);
    expect(element.querySelectorAll('app-revenue-highlight-card')).toHaveLength(2);
    expect(element.querySelectorAll('app-revenue-breakdown')).toHaveLength(2);
    expect(element.textContent).toContain(
      `${REVENUE_REPORT_TEXTS.CHART_TITLE} ${REVENUE_GRANULARITY_TITLES.week}`,
    );
    expect(element.textContent).toContain(
      `${REVENUE_REPORT_TEXTS.COMPARE_LABEL} 05.10 – 31.10.2026`,
    );
  });

  it('requests a fixed step after changing grouping', async () => {
    await create();

    (element.querySelector('input[value="month"]') as HTMLInputElement).click();
    await flushQueries(fixture);

    expect(calls().at(-1)).toEqual({
      shopId: 'shop-1',
      from: '2026-11-01',
      to: '2026-11-27',
      groupBy: 'month',
    });
  });

  it('ignores unknown grouping values', async () => {
    await create();

    (fixture.componentInstance as any).onGroupByChange('year');

    expect((fixture.componentInstance as any).groupBy()).toBe('auto');
  });

  it('hides comparison when the switch is off', async () => {
    await create();
    expect(element.querySelectorAll('.stat-card-change').length).toBeGreaterThan(0);

    const toggle = element.querySelector('input#revenue-compare') as HTMLInputElement;
    toggle.click();
    await fixture.whenStable();

    expect(element.querySelectorAll('.stat-card-change')).toHaveLength(0);
    expect(element.querySelector('.highlight-change')).toBeNull();
  });

  it('emits openOrders from a highlight link', async () => {
    await create();
    const opened = vi.fn();
    fixture.componentInstance.openOrders.subscribe(opened);

    (element.querySelector('.highlight-link') as HTMLButtonElement).click();

    expect(opened).toHaveBeenCalledTimes(1);
  });

  it('hides insights when there are none', async () => {
    mockService.getRevenueReport.mockReturnValue(of({ ...response, insights: [] }));

    await create();

    expect(element.querySelector('app-insight-list')).toBeNull();
  });

  it('shows the loading state while pending', async () => {
    mockService.getRevenueReport.mockReturnValue(NEVER);
    fixture = TestBed.createComponent(RevenueReport);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      REPORTS_TEXTS.LOADING_MESSAGE,
    );
    expect((fixture.componentInstance as any).chartTitle()).toBe(REVENUE_REPORT_TEXTS.CHART_TITLE);
    expect((fixture.componentInstance as any).compareLabel()).toBe(
      REVENUE_REPORT_TEXTS.COMPARE_LABEL,
    );
  });

  it('shows an error state', async () => {
    mockService.getRevenueReport.mockReturnValue(throwError(() => new Error('fail')));

    await create();

    expect(element.textContent).toContain(REPORTS_TEXTS.LOAD_ERROR_MESSAGE);
  });
});
