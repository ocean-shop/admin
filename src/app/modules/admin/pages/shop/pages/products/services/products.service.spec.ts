import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests products list with all supported query params', () => {
    service
      .getProducts({
        page: 2,
        limit: 20,
        shopId: 'shop-1',
        name: 'Phone',
        sku: 'SKU-1',
        categoryIds: ['cat-1', 'cat-2'],
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      .subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === 'http://localhost:3000/catalog/products',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('shopId')).toBe('shop-1');
    expect(req.request.params.get('name')).toBe('Phone');
    expect(req.request.params.get('sku')).toBe('SKU-1');
    expect(req.request.params.get('categoryIds')).toBe('cat-1,cat-2');
    expect(req.request.params.get('sortBy')).toBe('createdAt');
    expect(req.request.params.get('sortOrder')).toBe('desc');
    req.flush({ items: [], total: 0, page: 2, limit: 20, totalPages: 1 });
  });

  it('omits optional params when they are empty', () => {
    service
      .getProducts({
        page: 1,
        limit: 20,
        shopId: 'shop-1',
      })
      .subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === 'http://localhost:3000/catalog/products',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('name')).toBe(false);
    expect(req.request.params.has('sku')).toBe(false);
    expect(req.request.params.has('categoryIds')).toBe(false);
    expect(req.request.params.has('sortBy')).toBe(false);
    expect(req.request.params.has('sortOrder')).toBe(false);
    req.flush({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  });
});
