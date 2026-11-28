import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { REPORTS_TEXTS } from '../../constants/reports.constants';
import { ProductReportApi } from '../../models/product-report-api.model';
import { ProductReportQuery } from '../../models/report-query.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { ProductReport } from './product-report';

const response: ProductReportApi = {
  productsSold: 2,
  abcSummary: [{ abcClass: 'A', productsCount: 1, revenue: 900, revenueShare: 0.9 }],
  topProducts: [{ productId: 'p-1', name: 'Iphone', abcClass: 'A', revenue: 900 }],
  growing: [{ productId: 'p-2', name: 'Навушники', revenueChangePercent: 10 }],
  declining: [],
  deadStock: {
    days: 60,
    total: 1,
    items: [{ productId: 'p-3', name: 'Старий', lastSoldAt: null }],
  },
  insights: [{ code: 'dead_stock', severity: 'warning', message: 'Є мертві товари' }],
};

describe('ProductReport', () => {
  let fixture: ComponentFixture<ProductReport>;
  let element: HTMLElement;
  let mockService: { getProductReport: ReturnType<typeof vi.fn> };

  const calls = (): ProductReportQuery[] =>
    mockService.getProductReport.mock.calls.map(([query]) => query as ProductReportQuery);

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(ProductReport);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    mockService = { getProductReport: vi.fn().mockReturnValue(of(response)) };

    await TestBed.configureTestingModule({
      imports: [ProductReport],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: FinanceReportsService, useValue: mockService },
      ],
    }).compileComponents();
  });

  it('requests the report with default limits and renders sections', async () => {
    await create();

    expect(calls()).toEqual([
      { shopId: 'shop-1', from: '2026-11-01', to: '2026-11-27', limit: 10, deadStockDays: 60 },
    ]);
    expect(element.textContent).toContain('Є мертві товари');
    expect(element.querySelector('app-abc-summary')).not.toBeNull();
    expect(element.querySelectorAll('app-top-products-table tbody tr')).toHaveLength(1);
    expect(element.querySelectorAll('app-product-trends')).toHaveLength(2);
    expect(element.querySelectorAll('app-dead-stock-table tbody tr')).toHaveLength(1);
  });

  it('refetches with a new limit and dead stock days', async () => {
    await create();

    (
      element.querySelector('input[name="product-report-limit"][value="20"]') as HTMLInputElement
    ).click();
    await flushQueries(fixture);
    (
      element.querySelector(
        'input[name="product-report-dead-stock-days"][value="90"]',
      ) as HTMLInputElement
    ).click();
    await flushQueries(fixture);

    expect(calls().at(-1)).toEqual(expect.objectContaining({ limit: 20, deadStockDays: 90 }));
  });

  it('ignores unknown option values', async () => {
    await create();

    (fixture.componentInstance as any).onLimitChange(7);
    (fixture.componentInstance as any).onDeadStockDaysChange('x');

    expect((fixture.componentInstance as any).limit()).toBe(10);
    expect((fixture.componentInstance as any).deadStockDays()).toBe(60);
  });

  it('re-emits product clicks from the children', async () => {
    await create();
    const opened: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => opened.push(id));

    (
      element.querySelector('app-top-products-table .report-table-link') as HTMLButtonElement
    ).click();
    (element.querySelector('app-product-trends .trend-name') as HTMLButtonElement).click();
    (element.querySelector('app-dead-stock-table app-button button') as HTMLButtonElement).click();

    expect(opened).toEqual(['p-1', 'p-2', 'p-3']);
  });

  it('hides insights when there are none', async () => {
    mockService.getProductReport.mockReturnValue(of({ ...response, insights: null }));

    await create();

    expect(element.querySelector('app-insight-list')).toBeNull();
  });

  it('shows loading and error states', async () => {
    mockService.getProductReport.mockReturnValue(NEVER);
    await create();
    expect(element.textContent).toContain(REPORTS_TEXTS.LOADING_MESSAGE);

    fixture.destroy();
    mockService.getProductReport.mockReturnValue(throwError(() => new Error('fail')));
    fixture = TestBed.createComponent(ProductReport);
    fixture.componentRef.setInput('shopId', 'shop-2');
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    await flushQueries(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      REPORTS_TEXTS.LOAD_ERROR_MESSAGE,
    );
  });
});
