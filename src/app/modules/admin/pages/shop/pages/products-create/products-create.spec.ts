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
import { PRODUCTS_CREATE_TEXTS } from './constants/products-create.constants';
import { ProductsCreate } from './products-create';

describe('ProductsCreate', () => {
  let fixture: ComponentFixture<ProductsCreate>;
  let component: ProductsCreate;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockProductsService: {
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
    createVariation: ReturnType<typeof vi.fn>;
    updateVariation: ReturnType<typeof vi.fn>;
    toggleCategory: ReturnType<typeof vi.fn>;
    toggleAttribute: ReturnType<typeof vi.fn>;
    toggleTag: ReturnType<typeof vi.fn>;
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
      createVariation: vi.fn().mockReturnValue(of({ variations: [{ id: 'variation-1' }] })),
      updateVariation: vi.fn().mockReturnValue(of({ id: 'variation-1' })),
      toggleCategory: vi.fn().mockReturnValue(of({})),
      toggleAttribute: vi.fn().mockReturnValue(of({})),
      toggleTag: vi.fn().mockReturnValue(of({})),
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

    fixture = TestBed.createComponent(ProductsCreate);
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

  it('renders create page heading', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_CREATE_TEXTS.PAGE_TITLE,
    );
  });

  it('creates product and keeps user on page', () => {
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

  it('keeps sidebar disabled before product creation', () => {
    expect((component as any).isSidebarDisabled()).toBe(true);
  });

  it('toggles category assignment after product is created', () => {
    (component as any).createdProductId.set('product-1');

    (component as any).onCategoryToggle({ categoryId: 'cat-1', checked: true });

    expect(mockProductsService.toggleCategory).toHaveBeenCalledWith('product-1', {
      categoryId: 'cat-1',
      assign: true,
    });
  });

  it('assigns attribute after product is created', () => {
    (component as any).createdProductId.set('product-1');
    (component as any).attributeSearchResults.set([{ id: 'attr-1', label: 'Колір: Синій' }]);

    (component as any).onAttributeAssign('attr-1');

    expect(mockProductsService.toggleAttribute).toHaveBeenCalledWith('product-1', {
      attributeTypeId: 'attr-1',
      assign: true,
    });
  });

  it('assigns tag after product is created', () => {
    (component as any).createdProductId.set('product-1');
    (component as any).tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);

    (component as any).onTagAssign('tag-1');

    expect(mockProductsService.toggleTag).toHaveBeenCalledWith('product-1', {
      tagId: 'tag-1',
      assign: true,
    });
  });

  it('does not assign tag when product is not created yet', () => {
    (component as any).tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);

    (component as any).onTagAssign('tag-1');

    expect(mockProductsService.toggleTag).not.toHaveBeenCalled();
  });

  it('does not assign tag when option is absent', () => {
    (component as any).createdProductId.set('product-1');
    (component as any).tagSearchResults.set([]);

    (component as any).onTagAssign('tag-unknown');

    expect(mockProductsService.toggleTag).not.toHaveBeenCalled();
  });

  it('shows error toast when tag assignment fails', () => {
    mockProductsService.toggleTag.mockReturnValueOnce(throwError(() => new Error('Failed')));
    (component as any).createdProductId.set('product-1');
    (component as any).tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);

    (component as any).onTagAssign('tag-1');

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_ERROR_TITLE,
      PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_ERROR_MESSAGE,
    );
  });

  it('unassigns tag and updates local assigned list', () => {
    (component as any).createdProductId.set('product-1');
    (component as any).assignedTags.set([
      { id: 'tag-1', label: 'Літо' },
      { id: 'tag-2', label: 'Льон' },
    ]);

    (component as any).onTagUnassign('tag-1');

    expect(mockProductsService.toggleTag).toHaveBeenCalledWith('product-1', {
      tagId: 'tag-1',
      assign: false,
    });
    expect((component as any).assignedTags()).toEqual([{ id: 'tag-2', label: 'Льон' }]);
  });

  it('clears tag results when sidebar is disabled', () => {
    (component as any).tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);

    (component as any).onTagSearchChange('summer');

    expect((component as any).tagSearchResults()).toEqual([]);
    expect(mockTagsService.getTags).not.toHaveBeenCalled();
  });

  it('loads tag search results with debounce and excludes already assigned tags', () => {
    vi.useFakeTimers();
    (component as any).createdProductId.set('product-1');
    (component as any).assignedTags.set([{ id: 'tag-1', label: 'Літо' }]);
    mockTagsService.getTags.mockReturnValueOnce(
      of({
        items: [
          { id: 'tag-1', name: 'Літо' },
          { id: 'tag-2', name: 'Льон' },
          { id: '', name: 'broken' },
          { id: 'tag-3', name: '' },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
    );

    (component as any).onTagSearchChange('lin');
    vi.advanceTimersByTime(300);

    expect(mockTagsService.getTags).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      name: 'lin',
    });
    expect((component as any).tagSearchResults()).toEqual([
      { id: 'tag-2', label: 'Льон' },
      { id: 'tag-3', label: 'Тег' },
    ]);
  });

  it('handles tag search errors by resetting results', () => {
    vi.useFakeTimers();
    (component as any).createdProductId.set('product-1');
    (component as any).tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);
    mockTagsService.getTags.mockReturnValueOnce(throwError(() => new Error('Failed')));

    (component as any).onTagSearchChange('summer');
    vi.advanceTimersByTime(300);

    expect((component as any).tagSearchResults()).toEqual([]);
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
  });

  it('shows error toast when create request fails', () => {
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

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
      PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
    );
  });

  it('updates existing product on repeated submit', () => {
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
  });

  it('saves variation after product is created', () => {
    (component as any).createdProductId.set('product-1');
    (component as any).variations.set([
      {
        localId: 'variation-1',
        id: null,
        title: 'Синій M',
        name: 'Синій / M',
        price: '99.00',
        oldPrice: '120.00',
        sku: 'SKU-BL-M',
        available: true,
        isMain: false,
        attributes: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            attributeTypeId: '11111111-1111-4111-8111-111111111111',
            name: 'Колір',
            value: 'Синій',
            label: 'Колір: Синій',
          },
        ],
        attributeSearchValue: '',
        attributeSearchResults: [],
        isAttributeSearchLoading: false,
        images: [],
        isSaving: false,
      },
    ]);

    (component as any).onVariationCreate({ localId: 'variation-1' });

    expect(mockProductsService.createVariation).toHaveBeenCalledWith('product-1', {
      variation: 'product_variations',
      title: 'Синій M',
      name: 'Синій / M',
      sku: 'SKU-BL-M',
      price: 99,
      oldPrice: 120,
      available: true,
      isDefault: false,
      attributes: [{ attributeTypeId: '11111111-1111-4111-8111-111111111111' }],
      images: [],
    });
  });
});
