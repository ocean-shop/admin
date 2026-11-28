import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { FinanceReportsService } from './finance-reports.service';

describe('FinanceReportsService', () => {
  let service: FinanceReportsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${API_URL}/finance/reports`;
  const period = { shopId: 'shop-1', from: '2026-11-01', to: '2026-11-27' };

  const expectPeriodParams = (params: URLSearchParams | { get(name: string): string | null }) => {
    expect(params.get('shopId')).toBe('shop-1');
    expect(params.get('from')).toBe('2026-11-01');
    expect(params.get('to')).toBe('2026-11-27');
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FinanceReportsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the revenue report without groupBy for auto step', () => {
    service.getRevenueReport(period).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}/revenue`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expectPeriodParams(req.request.params);
    expect(req.request.params.has('groupBy')).toBe(false);
    req.flush({});
  });

  it('passes groupBy when it is set', () => {
    service.getRevenueReport({ ...period, groupBy: 'week' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}/revenue`);
    expect(req.request.params.get('groupBy')).toBe('week');
    req.flush({});
  });

  it('requests the product report with limits', () => {
    service.getProductReport({ ...period, limit: 10, deadStockDays: 60 }).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}/products`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expectPeriodParams(req.request.params);
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('deadStockDays')).toBe('60');
    req.flush({});
  });

  it('requests the customer report with period params only', () => {
    service.getCustomerReport(period).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}/customers`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expectPeriodParams(req.request.params);
    expect(req.request.params.keys()).toEqual(['shopId', 'from', 'to']);
    req.flush({});
  });

  it('requests the quick order report with period params only', () => {
    service.getQuickOrderReport(period).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}/quick-orders`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expectPeriodParams(req.request.params);
    expect(req.request.params.keys()).toEqual(['shopId', 'from', 'to']);
    req.flush({});
  });
});
