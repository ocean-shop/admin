import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { QuickOrderStatus } from '../../models/quick-order-status.enum';
import { QuickOrdersService } from './quick-orders.service';

describe('QuickOrdersService', () => {
  let service: QuickOrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuickOrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the list with required params only', () => {
    service.getQuickOrders({ page: 2, limit: 20, shopId: 'shop-1' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/quick-orders`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('shopId')).toBe('shop-1');
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], total: 0, page: 2, limit: 20, totalPages: 1 });
  });

  it('adds status and search params when given', () => {
    service
      .getQuickOrders({
        page: 1,
        limit: 1,
        shopId: 'shop-1',
        status: QuickOrderStatus.New,
        search: '067',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/quick-orders`);
    expect(req.request.params.get('status')).toBe(QuickOrderStatus.New);
    expect(req.request.params.get('search')).toBe('067');
    req.flush({ items: [], total: 0, page: 1, limit: 1, totalPages: 1 });
  });

  it('patches the quick order', () => {
    service.updateQuickOrder('quick-1', { status: QuickOrderStatus.Processed }).subscribe();

    const req = httpMock.expectOne(`${API_URL}/quick-orders/quick-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ status: QuickOrderStatus.Processed });
    req.flush({ id: 'quick-1', status: QuickOrderStatus.Processed });
  });
});
