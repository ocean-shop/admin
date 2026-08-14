import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { AttributesService } from '../attributes/services/attributes.service';
import { CategoriesService } from '../categories/services/categories.service';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { TagsService } from '../tags/services/tags.service';
import { PRODUCTS_CREATE_TEXTS } from './constants/products-create.constants';
import { ProductsCreate } from './products-create';

describe('ProductsCreate', () => {
  let fixture: ComponentFixture<ProductsCreate>;
  let component: ProductsCreate;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
  };
  let mockCategoriesService: {
    getCategories: ReturnType<typeof vi.fn>;
  };
  let mockAttributesService: {
    getAttributes: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };
  let mockTagsService: {
    getTags: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockProductsService = {
      createProduct: vi.fn().mockReturnValue(of({ id: 'product-1' })),
      updateProduct: vi.fn().mockReturnValue(of({ id: 'product-1' })),
    };
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(of([])),
    };
    mockAttributesService = {
      getAttributes: vi
        .fn()
        .mockReturnValue(of({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 })),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };
    mockTagsService = {
      getTags: vi
        .fn()
        .mockReturnValue(of({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 })),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsCreate],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: AttributesService, useValue: mockAttributesService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders create page heading', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_CREATE_TEXTS.PAGE_TITLE,
    );
  });

  it('keeps sidebar disabled before product creation', () => {
    expect((component as any).isSidebarDisabled()).toBe(true);
  });

  it('creates product and stores created product id', async () => {
    (component as any).productFormModel.set({
      name: 'Coastal Linen Shirt',
      type: ProductType.Simple,
      description: 'Lightweight beach shirt',
      price: '99.99',
      oldPrice: '129.99',
      sku: 'CSTL-SHRT-01',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();
    await fixture.whenStable();

    expect(mockProductsService.createProduct).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Coastal Linen Shirt',
      type: ProductType.Simple,
      description: 'Lightweight beach shirt',
      sku: 'CSTL-SHRT-01',
      status: ProductStatus.Draft,
      available: true,
      price: 99.99,
      oldPrice: 129.99,
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE,
    );
    expect((component as any).createdProductId()).toBe('product-1');
    expect((component as any).isSidebarDisabled()).toBe(false);
  });

  it('updates existing product when created product already exists', async () => {
    (component as any).createdProductId.set('product-1');
    (component as any).productFormModel.set({
      name: 'Updated Coastal Shirt',
      type: ProductType.Variable,
      description: 'Updated',
      price: '90',
      oldPrice: '100',
      sku: 'UPD-1',
      status: ProductStatus.Active,
      available: true,
    });

    (component as any).onSubmit();
    await fixture.whenStable();

    expect(mockProductsService.updateProduct).toHaveBeenCalledWith('product-1', {
      name: 'Updated Coastal Shirt',
      type: ProductType.Variable,
      description: 'Updated',
      sku: 'UPD-1',
      status: ProductStatus.Active,
      available: true,
      price: 90,
      oldPrice: 100,
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.UPDATE_SUCCESS_TITLE,
    );
  });

  it('does not submit when name is empty', () => {
    (component as any).productFormModel.set({
      name: '',
      type: ProductType.Variable,
      description: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();

    expect(mockProductsService.createProduct).not.toHaveBeenCalled();
    expect(mockProductsService.updateProduct).not.toHaveBeenCalled();
  });

  it('shows error toast when create request fails', async () => {
    mockProductsService.createProduct.mockReturnValueOnce(throwError(() => new Error('Failed')));
    (component as any).productFormModel.set({
      name: 'Coastal Hat',
      type: ProductType.Variable,
      description: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Archived,
      available: false,
    });

    (component as any).onSubmit();
    await fixture.whenStable();

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
    );
  });

  it('updates shop context and resets created product id on route change', async () => {
    (component as any).createdProductId.set('product-1');

    paramMap$.next(convertToParamMap({ shopId: 'shop-2' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).shopId()).toBe('shop-2');
    expect((component as any).createdProductId()).toBeNull();
  });
});
