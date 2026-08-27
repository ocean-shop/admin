import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OrderPaymentStatus } from '../models/order-payment-status.enum';
import { OrderStatus } from '../models/order-status.enum';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const API_URL = 'https://api-production-1765.up.railway.app';
  let service: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests orders list with query params', () => {
    service
      .getOrders({
        page: 2,
        limit: 20,
        shopId: 'shop-1',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/orders`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('shopId')).toBe('shop-1');
    req.flush({ items: [], total: 0, page: 2, limit: 20, totalPages: 1 });
  });

  it('includes optional filter and sorting params for orders list', () => {
    service
      .getOrders({
        page: 1,
        limit: 20,
        shopId: 'shop-1',
        orderNumber: '1001',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/orders`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('orderNumber')).toBe('1001');
    expect(req.request.params.get('sortBy')).toBe('createdAt');
    expect(req.request.params.get('sortOrder')).toBe('asc');
    req.flush({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  });

  it('requests single order by id', () => {
    service.getOrderById('order-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/orders/order-1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ id: 'order-1' });
  });

  it('deletes order by id', () => {
    service.deleteOrder('order-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/orders/order-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('updates payment status', () => {
    service
      .updateOrderPaymentStatus('order-1', {
        paymentStatus: OrderPaymentStatus.Paid,
      })
      .subscribe();

    const req = httpMock.expectOne(`${API_URL}/orders/order-1/payment-status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      paymentStatus: OrderPaymentStatus.Paid,
    });
    req.flush({ id: 'order-1' });
  });

  it('updates order status', () => {
    service
      .updateOrderStatus('order-1', {
        status: OrderStatus.Processing,
      })
      .subscribe();

    const req = httpMock.expectOne(`${API_URL}/orders/order-1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      status: OrderStatus.Processing,
    });
    req.flush({ id: 'order-1' });
  });
});
