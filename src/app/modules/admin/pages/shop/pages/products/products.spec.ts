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
    expect(element.textContent).toContain('Головна');
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

  it('ignores unknown sort values and unchanged filters', async () => {
    const initialCalls = mockProductsService.getProducts.mock.calls.length;
    (component as any).onSortSelected({ label: 'x', value: 'broken' });
    (component as any).onSortSelected({ label: 'x', value: 'newest' });
    (component as any).onApplyFilters();
    (component as any).onResetFilters();
    await fixture.whenStable();

    expect(mockProductsService.getProducts.mock.calls.length).toBe(initialCalls);
  });

  it('changes sort and resets the page', () => {
    (component as any).currentPage.set(3);
    (component as any).onSortSelected({ label: 'A-Z', value: 'alphabet' });

    expect((component as any).selectedSort()).toBe('alphabet');
    expect((component as any).currentPage()).toBe(1);
  });

  it('toggles category filter values', () => {
    (component as any).onCategoryOptionToggled({ label: 'A', value: 'a' });
    (component as any).onCategoryOptionToggled({ label: 'B', value: 'b' });
    (component as any).onCategoryOptionToggled({ label: 'A', value: 'a' });

    expect((component as any).categoryIdsInput()).toEqual(['b']);
  });

  it('resets applied filters', () => {
    (component as any).nameFilter.set('Shirt');
    (component as any).categoryIdsFilter.set(['a']);
    (component as any).currentPage.set(2);

    (component as any).onResetFilters();

    expect((component as any).nameFilter()).toBe('');
    expect((component as any).categoryIdsFilter()).toEqual([]);
    expect((component as any).currentPage()).toBe(1);
  });

  it('ignores rows without a known product', () => {
    (component as any).onDeleteProduct({ id: 'missing' });
    (component as any).onUpdateProduct({ id: null });

    expect((component as any).selectedProduct()).toBeNull();
  });

  it('closes the delete modal when idle', () => {
    (component as any).selectedProduct.set({ id: 'p', title: 'P' });
    (component as any).onCloseDeleteModal();

    expect((component as any).isDeleteModalOpen()).toBe(false);
  });
});
