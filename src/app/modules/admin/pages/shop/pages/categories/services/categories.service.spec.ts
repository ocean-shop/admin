import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreateCategoryPayload, UpdateCategoryPayload } from '../models/category-payload.model';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests categories list with credentials', () => {
    service.getCategories().subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/categories');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush([]);
  });

  it('requests a single category by id', () => {
    service.getCategoryById('category-1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/categories/category-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ id: 'category-1' });
  });

  it('creates a category', () => {
    const payload: CreateCategoryPayload = {
      shopId: 'shop-1',
      name: 'Electronics',
      slug: 'electronics',
    };

    service.createCategory(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'category-1' });
  });

  it('updates a category', () => {
    const payload: UpdateCategoryPayload = {
      name: 'Updated',
      slug: 'updated',
    };

    service.updateCategory('category-1', payload).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/categories/category-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'category-1' });
  });

  it('deletes a category', () => {
    service.deleteCategory('category-1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/catalog/categories/category-1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
