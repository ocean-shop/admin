import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { QUICK_ORDER_REPORT_TEXTS } from '../../constants/quick-order-report.constants';
import { REPORTS_TEXTS } from '../../constants/reports.constants';
import { QuickOrderReportApi } from '../../models/quick-order-report-api.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { QuickOrderReport } from './quick-order-report';

const response: QuickOrderReportApi = {
  previousPeriod: { from: '2026-10-05', to: '2026-10-31' },
  summary: { totalCount: 4, newCount: 1, processedCount: 2, cancelledCount: 1 },
  previousSummary: { totalCount: 2 },
  changes: { totalCount: 100 },
  topProducts: [{ productId: 'p-1', name: 'Iphone', requestsCount: 3 }],
};

describe('QuickOrderReport', () => {
  let fixture: ComponentFixture<QuickOrderReport>;
  let element: HTMLElement;
  let mockService: { getQuickOrderReport: ReturnType<typeof vi.fn> };

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(QuickOrderReport);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    mockService = { getQuickOrderReport: vi.fn().mockReturnValue(of(response)) };

    await TestBed.configureTestingModule({
      imports: [QuickOrderReport],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: FinanceReportsService, useValue: mockService },
      ],
    }).compileComponents();
  });

  it('requests the report for the period and renders sections', async () => {
    await create();

    expect(mockService.getQuickOrderReport).toHaveBeenCalledWith({
      shopId: 'shop-1',
      from: '2026-11-01',
      to: '2026-11-27',
    });
    expect(element.textContent).toContain(QUICK_ORDER_REPORT_TEXTS.ESTIMATE_NOTE);
    expect(element.textContent).toContain(
      `${QUICK_ORDER_REPORT_TEXTS.COMPARE_LABEL} 05.10 – 31.10.2026`,
    );
    expect(element.querySelectorAll('app-stat-card')).toHaveLength(4);
    expect(element.querySelectorAll('app-revenue-highlight-card')).toHaveLength(2);
    expect(element.querySelector('app-quick-order-status-split')).not.toBeNull();
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
  });

  it('hides changes when comparison is off', async () => {
    await create();
    expect(element.querySelector('.highlight-change')).not.toBeNull();

    (fixture.componentInstance as any).onCompareChange(false);
    await fixture.whenStable();

    expect(element.querySelector('.highlight-change')).toBeNull();
    expect(element.querySelector('.stat-card-change')).toBeNull();
  });

  it('re-emits product and quick orders navigation', async () => {
    await create();
    const products: string[] = [];
    let quickOrdersOpened = 0;
    fixture.componentInstance.openProduct.subscribe((id) => products.push(id));
    fixture.componentInstance.openQuickOrders.subscribe(() => quickOrdersOpened++);

    (element.querySelector('.report-table-link') as HTMLButtonElement).click();
    (element.querySelector('.highlight-link') as HTMLButtonElement).click();

    expect(products).toEqual(['p-1']);
    expect(quickOrdersOpened).toBe(1);
  });

  it('refetches when the period changes', async () => {
    await create();

    fixture.componentRef.setInput('period', { from: '2026-10-01', to: '2026-10-31' });
    await flushQueries(fixture);

    expect(mockService.getQuickOrderReport).toHaveBeenLastCalledWith({
      shopId: 'shop-1',
      from: '2026-10-01',
      to: '2026-10-31',
    });
  });

  it('shows the loading state with a plain compare label', async () => {
    mockService.getQuickOrderReport.mockReturnValue(NEVER);

    await create();

    expect(element.textContent).toContain(REPORTS_TEXTS.LOADING_MESSAGE);
    expect((fixture.componentInstance as any).compareLabel()).toBe(
      QUICK_ORDER_REPORT_TEXTS.COMPARE_LABEL,
    );
  });

  it('shows the error state', async () => {
    mockService.getQuickOrderReport.mockReturnValue(throwError(() => new Error('fail')));

    await create();

    expect(element.textContent).toContain(REPORTS_TEXTS.LOAD_ERROR_MESSAGE);
  });
});
