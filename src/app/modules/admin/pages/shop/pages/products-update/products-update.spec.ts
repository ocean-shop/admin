import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AttributesService } from '../attributes/services/attributes.service';
import { CategoriesService } from '../categories/services/categories.service';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { TagsService } from '../tags/services/tags.service';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';
import { ProductsUpdate } from './products-update';

describe('ProductsUpdate', () => {
  let fixture: ComponentFixture<ProductsUpdate>;
  let component: ProductsUpdate;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    getProductById: ReturnType<typeof vi.fn>;
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
    paramMap$ = new BehaviorSubject(
      convertToParamMap({ shopId: 'shop-1', productId: 'product-1' }),
    );
    mockProductsService = {
      getProductById: vi.fn().mockReturnValue(
        of({
          id: 'product-1',
          name: 'Coastal Shirt',
          type: ProductType.Variable,
          description: 'Wind-friendly shirt',
          price: 99.5,
          oldPrice: 119.99,
          sku: 'SKU-1',
          status: ProductStatus.Active,
          available: false,
          categories: [{ id: 'cat-1', name: 'Одяг' }],
          attributes: [{ id: 'attr-1', name: 'Колір', value: 'Синій' }],
          tags: [{ id: 'tag-1', name: 'Літо' }],
          images: [{ id: 'img-1', image: 'https://cdn.example.com/cover.jpg', name: 'Cover' }],
          variations: [],
        }),
      ),
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
      imports: [ProductsUpdate],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ProductsService, useValue: mockProductsService },
        { provide: AttributesService, useValue: mockAttributesService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsUpdate);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders update page heading and description', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCTS_UPDATE_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(PRODUCTS_UPDATE_TEXTS.PAGE_DESCRIPTION);
  });

  it('loads product by id and seeds form state', () => {
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
    expect((component as any).productFormModel().name).toBe('Coastal Shirt');
    expect((component as any).productFormModel().type).toBe(ProductType.Variable);
    expect((component as any).productFormModel().price).toBe('99.50');
    expect((component as any).assignedAttributes()).toEqual([
      { id: 'attr-1', label: 'Колір: Синій' },
    ]);
    expect((component as any).assignedTags()).toEqual([{ id: 'tag-1', label: 'Літо' }]);
    expect((component as any).images()).toEqual([
      { id: 'img-1', name: 'Cover', imageDataUrl: 'https://cdn.example.com/cover.jpg' },
    ]);
  });

  it('submits valid form and shows success toast', () => {
    (component as any).productFormModel.set({
      name: 'Updated shirt',
      type: ProductType.Simple,
      description: 'Updated description',
      price: '45.10',
      oldPrice: '55.10',
      sku: 'UPDATED-1',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();

    expect(mockProductsService.updateProduct).toHaveBeenCalledWith('product-1', {
      name: 'Updated shirt',
      type: ProductType.Simple,
      description: 'Updated description',
      sku: 'UPDATED-1',
      status: ProductStatus.Draft,
      available: true,
      price: 45.1,
      oldPrice: 55.1,
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.UPDATE_SUCCESS_TITLE,
    );
  });

  it('does not submit when name is empty', () => {
    (component as any).productFormModel.set({
      name: '',
      type: ProductType.Simple,
      description: '',
      price: '',
      oldPrice: '',
      sku: '',
      status: ProductStatus.Draft,
      available: true,
    });

    (component as any).onSubmit();

    expect(mockProductsService.updateProduct).not.toHaveBeenCalled();
  });

  it('shows error toast when update request fails', () => {
    mockProductsService.updateProduct.mockReturnValueOnce(throwError(() => new Error('Failed')));
    (component as any).productFormModel.set({
      name: 'Updated hat',
      type: ProductType.Variable,
      description: '',
      price: '',
      oldPrice: '',
      sku: 'SKU-2',
      status: ProductStatus.Active,
      available: false,
    });

    (component as any).onSubmit();

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_TITLE,
      PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_MESSAGE,
    );
  });

  it('updates context and reloads product on route change', async () => {
    mockProductsService.getProductById.mockReturnValueOnce(
      of({
        id: 'product-2',
        name: 'Coastal Pants',
        type: ProductType.Simple,
        status: ProductStatus.Draft,
        available: true,
        categories: [],
        attributes: [],
        tags: [],
        images: [],
        variations: [],
      }),
    );

    paramMap$.next(convertToParamMap({ shopId: 'shop-1', productId: 'product-2' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).productId()).toBe('product-2');
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-2');
    expect((component as any).productFormModel().name).toBe('Coastal Pants');
  });

  it('shows load error toast when product request fails', async () => {
    mockProductsService.getProductById.mockReturnValueOnce(throwError(() => new Error('Missing')));

    paramMap$.next(convertToParamMap({ shopId: 'shop-1', productId: 'missing-product' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_TITLE,
      PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_MESSAGE,
    );
  });
});
