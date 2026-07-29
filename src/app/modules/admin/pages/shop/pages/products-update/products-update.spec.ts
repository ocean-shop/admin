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
          attributes: [{ id: 'attr-1', name: 'Колір', value: 'Синій' }],
          tags: [{ id: 'tag-1', name: 'Літо' }],
          images: [{ id: 'img-1', image: 'https://cdn.example.com/cover.jpg', name: 'Cover' }],
          variations: [
            {
              id: 'variation-1',
              title: 'Синій M',
              name: 'Синій / M',
              sku: 'SKU-BL-M',
              price: 99.5,
              oldPrice: 120,
              available: true,
              isDefault: false,
              attributes: [
                {
                  id: 'attribute-link-1',
                  attributeTypeId: '11111111-1111-4111-8111-111111111111',
                  name: 'Колір',
                  value: 'Синій',
                },
              ],
              images: [
                { id: 'img-v1', image: 'https://cdn.example.com/variation-cover.jpg', name: 'V1' },
              ],
            },
          ],
        }),
      ),
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

  it('renders update page texts', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCTS_UPDATE_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(PRODUCTS_UPDATE_TEXTS.PAGE_DESCRIPTION);
  });

  it('loads product by id and prefills the form', () => {
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
    expect((component as any).productFormModel().name).toBe('Coastal Shirt');
    expect((component as any).productFormModel().type).toBe(ProductType.Variable);
    expect((component as any).productFormModel().price).toBe('99.50');
    expect((component as any).productFormModel().available).toBe(false);
    expect((component as any).assignedAttributes()).toEqual([
      { id: 'attr-1', label: 'Колір: Синій' },
    ]);
    expect((component as any).assignedTags()).toEqual([{ id: 'tag-1', label: 'Літо' }]);
    expect((component as any).images()).toEqual([
      { id: 'img-1', name: 'Cover', imageDataUrl: 'https://cdn.example.com/cover.jpg' },
    ]);
    expect((component as any).variations()).toHaveLength(1);
    expect((component as any).variations()[0].id).toBe('variation-1');
  });

  it('toggles product category assignment', () => {
    (component as any).onCategoryToggle({ categoryId: 'cat-1', checked: true });

    expect(mockProductsService.toggleCategory).toHaveBeenCalledWith('product-1', {
      categoryId: 'cat-1',
      assign: true,
    });
  });

  it('toggles product attribute assignment', () => {
    (component as any).attributeSearchResults.set([{ id: 'attr-2', label: 'Розмір: L' }]);

    (component as any).onAttributeAssign('attr-2');
    (component as any).onAttributeUnassign('attr-1');

    expect(mockProductsService.toggleAttribute).toHaveBeenNthCalledWith(1, 'product-1', {
      attributeTypeId: 'attr-2',
      assign: true,
    });
    expect(mockProductsService.toggleAttribute).toHaveBeenNthCalledWith(2, 'product-1', {
      attributeTypeId: 'attr-1',
      assign: false,
    });
  });

  it('toggles product tag assignment', () => {
    (component as any).tagSearchResults.set([{ id: 'tag-2', label: 'Льон' }]);

    (component as any).onTagAssign('tag-2');
    (component as any).onTagUnassign('tag-1');

    expect(mockProductsService.toggleTag).toHaveBeenNthCalledWith(1, 'product-1', {
      tagId: 'tag-2',
      assign: true,
    });
    expect(mockProductsService.toggleTag).toHaveBeenNthCalledWith(2, 'product-1', {
      tagId: 'tag-1',
      assign: false,
    });
  });

  it('does not assign tag when option is absent', () => {
    (component as any).tagSearchResults.set([]);

    (component as any).onTagAssign('tag-unknown');

    expect(mockProductsService.toggleTag).not.toHaveBeenCalled();
  });

  it('shows error toast when tag unassignment fails', () => {
    mockProductsService.toggleTag.mockReturnValueOnce(throwError(() => new Error('Failed')));

    (component as any).onTagUnassign('tag-1');

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      PRODUCTS_UPDATE_TEXTS.TAG_ASSIGN_ERROR_TITLE,
      PRODUCTS_UPDATE_TEXTS.TAG_ASSIGN_ERROR_MESSAGE,
    );
  });

  it('loads tag search results with debounce and excludes already assigned tags', () => {
    vi.useFakeTimers();
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
    (component as any).tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);
    mockTagsService.getTags.mockReturnValueOnce(throwError(() => new Error('Failed')));

    (component as any).onTagSearchChange('summer');
    vi.advanceTimersByTime(300);

    expect((component as any).tagSearchResults()).toEqual([]);
  });

  it('normalizes mixed product tag shapes into assigned tags', async () => {
    mockProductsService.getProductById.mockReturnValueOnce(
      of({
        id: 'product-2',
        name: 'Coastal Pants',
        type: ProductType.Simple,
        status: ProductStatus.Draft,
        tags: [
          'tag-raw',
          { tagId: 'tag-2', tag: { name: 'Льон' } },
          { tag: { id: 'tag-3' } },
          { id: 'tag-4', name: '' },
          { id: 'tag-2', name: 'Льон' },
        ],
      }),
    );

    paramMap$.next(convertToParamMap({ shopId: 'shop-1', productId: 'product-2' }));
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).assignedTags()).toEqual([
      { id: 'tag-raw', label: 'tag-raw' },
      { id: 'tag-2', label: 'Льон' },
      { id: 'tag-3', label: 'Теги' },
      { id: 'tag-4', label: 'Теги' },
    ]);
  });

  it('submits valid form and keeps user on update page', () => {
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

  it('updates variation when variation has persistent id', () => {
    (component as any).variations.set([
      {
        localId: 'variation-1',
        id: 'variation-1',
        title: 'Синій M',
        name: 'Синій / M',
        price: '99.00',
        oldPrice: '120.00',
        sku: 'SKU-BL-M',
        available: true,
        isMain: true,
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

    expect(mockProductsService.updateVariation).toHaveBeenCalledWith('product-1', 'variation-1', {
      title: 'Синій M',
      name: 'Синій / M',
      sku: 'SKU-BL-M',
      price: 99,
      oldPrice: 120,
      available: true,
      isDefault: true,
      attributes: [{ attributeTypeId: '11111111-1111-4111-8111-111111111111' }],
      images: [],
    });
  });
});
