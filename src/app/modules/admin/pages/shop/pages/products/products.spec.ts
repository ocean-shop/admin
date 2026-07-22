import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
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
  let mockToasterService: { success: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    const firstPageResponse: ProductListResponse = {
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
      total: 25,
      page: 1,
      limit: 20,
      totalPages: 2,
    };
    const secondPageResponse: ProductListResponse = {
      items: [
        {
          id: 'product-2',
          shopId: 'shop-1',
          title: 'Tablet',
          sku: 'SKU-002',
          type: 'variable',
          status: 'draft',
          price: 80,
          categories: [{ id: 'cat-2', name: 'Gadgets' }],
        },
      ],
      total: 25,
      page: 2,
      limit: 20,
      totalPages: 2,
    };

    mockProductsService = {
      getProducts: vi
        .fn()
        .mockReturnValueOnce(of(firstPageResponse))
        .mockReturnValue(of(secondPageResponse)),
      deleteProduct: vi.fn().mockReturnValue(of(void 0)),
    };
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(
        of({
          items: [
            { id: 'cat-1', name: 'Electronics' },
            { id: 'cat-2', name: 'Gadgets', parentId: 'cat-1' },
          ],
        }),
      ),
    };
    mockToasterService = {
      success: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
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

  it('renders title and create action', () => {
    const pageElement = fixture.nativeElement as HTMLElement;
    expect(pageElement.textContent).toContain(PRODUCTS_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(PRODUCTS_TEXTS.CREATE_LABEL);
  });

  it('loads products with shopId, pagination and default sort', () => {
    expect(mockProductsService.getProducts).toHaveBeenCalledTimes(1);
    expect(mockProductsService.getProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(mockCategoriesService.getCategories).toHaveBeenCalledWith('shop-1');
  });

  it('builds tree-formatted category options for the multi-select filter', () => {
    expect((component as any).categoryOptions()).toEqual([
      { label: 'Electronics', value: 'cat-1', level: 0 },
      { label: 'Gadgets', value: 'cat-2', parentId: 'cat-1', level: 1 },
    ]);
  });

  it('renders mapped table values from API response', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain('Phone');
    expect(pageElement.textContent).toContain('SKU-001');
    expect(pageElement.textContent).toContain('Simple');
    expect(pageElement.textContent).toContain('Active');
    expect(pageElement.textContent).toContain('123.45');
    expect(pageElement.textContent).toContain('Electronics');
  });

  it('applies filters and resets page to first page', () => {
    (component as any).currentPage.set(2);
    (component as any).nameInput.set('Phone');
    (component as any).skuInput.set('SKU-123');
    (component as any).onCategoryOptionToggled({ label: 'Electronics', value: 'cat-1' });

    (component as any).onApplyFilters();

    expect(mockProductsService.getProducts).toHaveBeenNthCalledWith(2, {
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      name: 'Phone',
      sku: 'SKU-123',
      categoryIds: ['cat-1'],
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('changes sort and refetches with mapped sort params', () => {
    (component as any).onSortSelected({ label: 'За алфавітом', value: 'alphabet' });

    expect(mockProductsService.getProducts).toHaveBeenNthCalledWith(2, {
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('requests selected page when pagination page is clicked', async () => {
    const pageButtons = fixture.debugElement.queryAll(By.css('.pagination-page-button'));
    const secondPageButton = pageButtons.find(
      (button) => (button.nativeElement as HTMLButtonElement).textContent?.trim() === '2',
    );

    secondPageButton?.triggerEventHandler('click');
    await fixture.whenStable();

    expect(mockProductsService.getProducts).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('shows warning and clears products when shopId is missing', async () => {
    paramMap$.next(convertToParamMap({}));
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_TEXTS.SHOP_ID_REQUIRED_MESSAGE,
    );
    expect((component as any).products()).toEqual([]);
  });

  it('navigates to product create page from create action', () => {
    (component as any).onCreateProduct();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/shop',
      'shop-1',
      'products',
      'create',
    ]);
  });

  it('navigates to product update page from row action', () => {
    (component as any).onUpdateProduct({ id: 'product-1' });

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/shop',
      'shop-1',
      'products',
      'product-1',
      'update',
    ]);
  });

  it('deletes product from row action and refetches list', () => {
    const getProductsCallsBeforeDelete = mockProductsService.getProducts.mock.calls.length;

    (component as any).onDeleteProduct({ id: 'product-1' });

    expect(mockProductsService.deleteProduct).toHaveBeenCalledWith('product-1');
    expect(mockProductsService.getProducts).toHaveBeenCalledTimes(getProductsCallsBeforeDelete + 1);
  });
});
