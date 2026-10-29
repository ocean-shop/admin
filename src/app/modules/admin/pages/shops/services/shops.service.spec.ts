import { HttpRequest, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { ShopCreatePayload, ShopUpdatePayload } from '../models/shop-payload.model';
import { ShopsService } from './shops.service';

describe('ShopsService', () => {
  let service: ShopsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ShopsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests shops list with pagination params', () => {
    service.getShops({ page: 3, limit: 25 }).subscribe();

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${API_URL}/catalog/shops` &&
        request.params.get('page') === '3' &&
        request.params.get('limit') === '25'
      );
    });
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ items: [], total: 0, page: 3, limit: 25, totalPages: 1 });
  });

  it('creates shop with payload', () => {
    const payload: ShopCreatePayload = { name: 'Ocean Shop', description: 'Sea goods' };
    service.createShop(payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/shops`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'shop-1' });
  });

  it('updates shop with payload', () => {
    const payload: ShopUpdatePayload = { name: 'Updated Shop', url: 'https://shop.test' };
    service.updateShop('shop-1', payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/shops/shop-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'shop-1' });
  });

  it('deletes shop by id', () => {
    service.deleteShop('shop-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/shops/shop-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  describe('getAllShops', () => {
    const matchPage = (page: number) => (request: HttpRequest<unknown>) =>
      request.url === `${API_URL}/catalog/shops` && request.params.get('page') === String(page);

    it('loads every page and flattens the items', () => {
      let result: unknown;
      service.getAllShops(2).subscribe((shops) => (result = shops));

      httpMock.expectOne(matchPage(1)).flush({ items: [{ id: '1' }], totalPages: 2 });
      httpMock.expectOne(matchPage(2)).flush({ shops: [{ id: '2' }] });

      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });

    it('stops after the first page for bare array responses', () => {
      let result: unknown;
      service.getAllShops(2).subscribe((shops) => (result = shops));

      httpMock.expectOne(matchPage(1)).flush([{ id: '1' }]);

      expect(result).toEqual([{ id: '1' }]);
    });
  });
});
