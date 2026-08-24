import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { CategoriesService } from '../categories/services/categories.service';
import { PRODUCTS_TEXTS } from './constants/products.constants';
import { ProductListResponse } from './models/product.model';
import { Products } from './products';
import { ProductsService } from './services/products.service';

describe('Products', () => {
  let fixture: ComponentFixture<Products>;
  let component: Products;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    getProducts: ReturnType<typeof vi.fn>;
    deleteProduct: ReturnType<typeof vi.fn>;
  };
  let mockCategoriesService: { getCategories: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    const response: ProductListResponse = {
      items: [
        {
          id: 'product-1',
          shopId: 'shop-1',
          title: 'Phone',
          sku: 'SKU-001',
          type: 'simple',
          status: 'active',
          price: 123.45,
          categories: [{ id: 'cat-1', name: 'Electronics' }],
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    mockProductsService = {
      getProducts: vi.fn().mockReturnValue(of(response)),
      deleteProduct: vi.fn().mockReturnValue(of(void 0)),
    };
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(of({ items: [{ id: 'cat-1', name: 'Electronics' }] })),
    };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders breadcrumbs for shop page', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Dashboard');
    expect(element.textContent).toContain(PRODUCTS_TEXTS.PAGE_TITLE);
  });

  it('requests product list with default params', () => {
    expect(mockProductsService.getProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('navigates to create page', () => {
    (component as any).onCreateProduct();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/shop',
      'shop-1',
      'products',
      'create',
    ]);
  });

  it('navigates to update page', () => {
    (component as any).onUpdateProduct({ id: 'product-1' });
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/shop',
      'shop-1',
      'products',
      'product-1',
      'update',
    ]);
  });

  it('applies filters and requests filtered list', async () => {
    (component as any).nameInput.set('Phone');
    (component as any).onApplyFilters();
    await fixture.whenStable();

    expect(mockProductsService.getProducts).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      name: 'Phone',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('deletes selected product', async () => {
    (component as any).selectedProduct.set({
      id: 'product-1',
      shopId: 'shop-1',
      title: 'Phone',
      sku: 'SKU-001',
      type: 'Simple',
      status: 'Active',
      price: '123.45',
      categories: 'Electronics',
    });

    (component as any).onConfirmDelete();
    await fixture.whenStable();

    expect(mockProductsService.deleteProduct).toHaveBeenCalledWith('product-1');
  });

  it('maps sort options to query parameters', () => {
    expect((component as any).resolveSortQuery('older')).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
    expect((component as any).resolveSortQuery('alphabet')).toEqual({
      sortBy: 'name',
      sortOrder: 'asc',
    });
    expect((component as any).resolveSortQuery('newest')).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('extracts categories from all supported response shapes', () => {
    expect((component as any).extractCategories([{ id: 'a', name: 'A' }])).toEqual([
      { id: 'a', name: 'A' },
    ]);
    expect((component as any).extractCategories({ items: [{ id: 'b', name: 'B' }] })).toEqual([
      { id: 'b', name: 'B' },
    ]);
    expect((component as any).extractCategories({ categories: [{ id: 'c', name: 'C' }] })).toEqual([
      { id: 'c', name: 'C' },
    ]);
    expect((component as any).extractCategories({ data: [{ id: 'd', name: 'D' }] })).toEqual([
      { id: 'd', name: 'D' },
    ]);
    expect((component as any).extractCategories({})).toEqual([]);
  });

  it('formats product labels and ids for edge cases', () => {
    expect((component as any).resolveTypeLabel('simple')).toBe('Simple');
    expect((component as any).resolveTypeLabel('variable')).toBe('Variable');
    expect((component as any).resolveTypeLabel('custom-type')).toBe('Custom Type');
    expect((component as any).resolveTypeLabel(undefined)).toBe('—');

    expect((component as any).resolveStatusLabel('active')).toBe('Active');
    expect((component as any).resolveStatusLabel('draft')).toBe('Draft');
    expect((component as any).resolveStatusLabel('archived')).toBe('Archived');
    expect((component as any).resolveStatusLabel('pending-review')).toBe('Pending Review');
    expect((component as any).resolveStatusLabel(undefined)).toBe('—');

    expect((component as any).resolvePriceLabel(25)).toBe('25.00');
    expect((component as any).resolvePriceLabel(' 50.10 ')).toBe('50.10');
    expect((component as any).resolvePriceLabel('   ')).toBe('—');
    expect((component as any).resolvePriceLabel(undefined)).toBe('—');

    expect((component as any).resolveProductId({ id: ' product-1 ' })).toBe('product-1');
    expect((component as any).resolveProductId({ id: 100 })).toBe('100');
    expect((component as any).resolveProductId({ id: null })).toBeNull();
  });

  it('handles array equality and guard branches', async () => {
    expect((component as any).areArraysEqual(['a'], ['a'])).toBe(true);
    expect((component as any).areArraysEqual(['a'], ['b'])).toBe(false);
    expect((component as any).areArraysEqual(['a'], ['a', 'b'])).toBe(false);
    expect((component as any).isValidSortValue('newest')).toBe(true);
    expect((component as any).isValidSortValue('broken')).toBe(false);

    const initialCalls = mockProductsService.getProducts.mock.calls.length;
    (component as any).onSortSelected({ label: 'x', value: 'broken' });
    (component as any).onApplyFilters();
    (component as any).onResetFilters();
    await fixture.whenStable();

    expect(mockProductsService.getProducts.mock.calls.length).toBe(initialCalls);
  });
});
