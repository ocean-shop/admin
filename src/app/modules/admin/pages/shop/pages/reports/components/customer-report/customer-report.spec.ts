import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { CUSTOMER_SEGMENTS } from '../../constants/customer-report.constants';
import { REPORTS_TEXTS } from '../../constants/reports.constants';
import { CustomerReportApi } from '../../models/customer-report-api.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { CustomerReport } from './customer-report';

const response: CustomerReportApi = {
  summary: { activeCustomers: 158, periodRevenue: 1000, returningRevenue: 400 },
  segments: [{ segment: 'champions', customersCount: 3 }],
  insights: [{ code: 'low_repeat_rate', severity: 'warning', message: 'Мало повторних' }],
};

describe('CustomerReport', () => {
  let fixture: ComponentFixture<CustomerReport>;
  let element: HTMLElement;
  let mockService: { getCustomerReport: ReturnType<typeof vi.fn> };

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(CustomerReport);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('period', { from: '2026-11-01', to: '2026-11-27' });
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    mockService = { getCustomerReport: vi.fn().mockReturnValue(of(response)) };

    await TestBed.configureTestingModule({
      imports: [CustomerReport],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: FinanceReportsService, useValue: mockService },
      ],
    }).compileComponents();
  });

  it('requests the report for the period and renders sections', async () => {
    await create();

    expect(mockService.getCustomerReport).toHaveBeenCalledWith({
      shopId: 'shop-1',
      from: '2026-11-01',
      to: '2026-11-27',
    });
    expect(element.textContent).toContain('Мало повторних');
    expect(element.querySelectorAll('app-stat-card')).toHaveLength(6);
    expect(element.querySelector('.stat-card-change')).toBeNull();
    expect(element.querySelector('app-new-returning-split')).not.toBeNull();
    expect(element.querySelectorAll('.segment')).toHaveLength(CUSTOMER_SEGMENTS.length);
  });

  it('refetches when the period changes', async () => {
    await create();

    fixture.componentRef.setInput('period', { from: '2026-10-01', to: '2026-10-31' });
    await flushQueries(fixture);

    expect(mockService.getCustomerReport).toHaveBeenLastCalledWith({
      shopId: 'shop-1',
      from: '2026-10-01',
      to: '2026-10-31',
    });
  });

  it('hides insights when there are none', async () => {
    mockService.getCustomerReport.mockReturnValue(of({ summary: {} }));

    await create();

    expect(element.querySelector('app-insight-list')).toBeNull();
  });

  it('shows the loading state', async () => {
    mockService.getCustomerReport.mockReturnValue(NEVER);

    await create();

    expect(element.textContent).toContain(REPORTS_TEXTS.LOADING_MESSAGE);
  });

  it('shows the error state', async () => {
    mockService.getCustomerReport.mockReturnValue(throwError(() => new Error('fail')));

    await create();

    expect(element.textContent).toContain(REPORTS_TEXTS.LOAD_ERROR_MESSAGE);
  });
});
