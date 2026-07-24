import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductStatus } from '../models/product-status.enum';
import { ProductType } from '../models/product-type.enum';
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

  it('requests single product by id', () => {
    service.getProductById('product-1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ id: 'product-1' });
  });

  it('creates product with payload', () => {
    const payload = {
      shopId: 'shop-1',
      type: ProductType.Simple,
      name: 'Coastal Linen Shirt',
      description: 'Lightweight shirt.',
      status: ProductStatus.Draft,
      available: true,
      sku: 'CSTL-SHRT-01',
      price: 99.99,
      oldPrice: 119.99,
    };

    service.createProduct(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'product-1', ...payload });
  });

  it('updates product with payload', () => {
    const payload = {
      name: 'Updated Coastal Shirt',
      type: ProductType.Variable,
      description: 'Updated description.',
      status: ProductStatus.Active,
      available: true,
      sku: 'UPD-SHRT-01',
      price: 89.99,
      oldPrice: 109.99,
    };

    service.updateProduct('product-1', payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'product-1', ...payload });
  });

  it('assigns category to product', () => {
    service.assignCategory('product-1', 'category-1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ categoryId: 'category-1', assign: true });
    req.flush({});
  });

  it('toggles category assignment for product', () => {
    const payload = { categoryId: 'category-2', assign: false };
    service.toggleCategory('product-1', payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('toggles attribute assignment for product', () => {
    const payload = { attributeTypeId: 'attribute-2', assign: false };
    service.toggleAttribute('product-1', payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1/attributes');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('toggles tag assignment for product', () => {
    const payload = { tagId: 'tag-2', assign: false };
    service.toggleTag('product-1', payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1/tags');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('assigns product images with sort order', () => {
    const payload = {
      images: [
        { image: 'data:image/jpeg;base64,Zm9v', sort: 0 },
        { image: 'data:image/jpeg;base64,YmFy', sort: 1 },
      ],
    };
    service.assignImages('product-1', payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1/images');
    expect(req.request.method).toBe('PUT');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('deletes product by id', () => {
    service.deleteProduct('product-1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/products/product-1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
