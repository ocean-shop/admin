import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { CreateAttributePayload } from '../models/attribute-payload.model';
import { AttributesService } from './attributes.service';

describe('AttributesService', () => {
  let service: AttributesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AttributesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets attributes with optional name param', () => {
    service.getAttributes({ page: 1, limit: 20, shopId: 'shop-1', name: 'size' }).subscribe();

    const req = httpMock.expectOne(
      `${API_URL}/catalog/attributes?page=1&limit=20&shopId=shop-1&name=size`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  });

  it('gets attributes without name param when not provided', () => {
    service.getAttributes({ page: 2, limit: 10, shopId: 'shop-2' }).subscribe();

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${API_URL}/catalog/attributes` &&
        request.params.get('page') === '2' &&
        request.params.get('limit') === '10' &&
        request.params.get('shopId') === 'shop-2' &&
        !request.params.has('name')
      );
    });

    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ items: [], total: 0, page: 2, limit: 10, totalPages: 1 });
  });

  it('creates attribute with payload', () => {
    const payload: CreateAttributePayload = {
      shopId: 'shop-1',
      name: 'Size',
      value: 'XL',
    };

    service.createAttribute(payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/attributes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'attribute-1' });
  });

  it('deletes attribute by id', () => {
    service.deleteAttribute('attribute-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/catalog/attributes/attribute-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
