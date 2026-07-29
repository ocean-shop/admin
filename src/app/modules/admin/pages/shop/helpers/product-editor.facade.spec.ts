import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { of, throwError } from 'rxjs';
import { AttributesService } from '../pages/attributes/services/attributes.service';
import { CategoriesService } from '../pages/categories/services/categories.service';
import { ProductsService } from '../pages/products/services/products.service';
import { TagsService } from '../pages/tags/services/tags.service';
import { ProductEditorFacade } from '../facades/product-editor.facade';

describe('ProductEditorFacade', () => {
  let facade: ProductEditorFacade;
  let mockProductsService: {
    getProductById: ReturnType<typeof vi.fn>;
    createVariation: ReturnType<typeof vi.fn>;
    updateVariation: ReturnType<typeof vi.fn>;
    toggleCategory: ReturnType<typeof vi.fn>;
    toggleAttribute: ReturnType<typeof vi.fn>;
    toggleTag: ReturnType<typeof vi.fn>;
    assignImages: ReturnType<typeof vi.fn>;
    changeImageSort: ReturnType<typeof vi.fn>;
    removeImage: ReturnType<typeof vi.fn>;
  };
  let mockAttributesService: {
    getAttributes: ReturnType<typeof vi.fn>;
  };
  let mockTagsService: {
    getTags: ReturnType<typeof vi.fn>;
  };
  let mockCategoriesService: {
    getCategories: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };
  let currentProductId: string | null;
  let sidebarEnabled: boolean;

  beforeEach(() => {
    currentProductId = 'product-1';
    sidebarEnabled = true;

    mockProductsService = {
      getProductById: vi.fn().mockReturnValue(
        of({
          id: 'product-1',
          images: [
            { id: 'api-img-1', image: 'https://cdn.example.com/img-1.jpg', name: 'Image 1' },
          ],
        }),
      ),
      toggleCategory: vi.fn().mockReturnValue(of({})),
      toggleAttribute: vi.fn().mockReturnValue(of({})),
      toggleTag: vi.fn().mockReturnValue(of({})),
      createVariation: vi.fn().mockReturnValue(of({ variations: [{ id: 'variation-1' }] })),
      updateVariation: vi.fn().mockReturnValue(of({ id: 'variation-1' })),
      assignImages: vi.fn().mockReturnValue(of({})),
      changeImageSort: vi.fn().mockReturnValue(of({})),
      removeImage: vi.fn().mockReturnValue(of({})),
    };
    mockAttributesService = {
      getAttributes: vi
        .fn()
        .mockReturnValue(of({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 })),
    };
    mockTagsService = {
      getTags: vi
        .fn()
        .mockReturnValue(of({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 })),
    };
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(of([{ id: 'cat-1', name: 'Категорія 1' }])),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProductEditorFacade,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: AttributesService, useValue: mockAttributesService },
        { provide: TagsService, useValue: mockTagsService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    });

    facade = TestBed.inject(ProductEditorFacade);
    facade.configure({
      getShopId: () => 'shop-1',
      getProductId: () => currentProductId,
      isSidebarEnabled: () => sidebarEnabled,
      texts: {
        CATEGORIES_LOAD_ERROR_TITLE: 'Категорії не завантажено',
        CATEGORIES_LOAD_ERROR_MESSAGE: 'Помилка',
        CATEGORY_ASSIGN_SUCCESS_TITLE: 'Категорію прив’язано',
        CATEGORY_UNASSIGN_SUCCESS_TITLE: 'Категорію відв’язано',
        CATEGORY_ASSIGN_ERROR_TITLE: 'Категорію не оновлено',
        CATEGORY_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз',
        ATTRIBUTE_ASSIGN_SUCCESS_TITLE: 'Атрибут прив’язано',
        ATTRIBUTE_UNASSIGN_SUCCESS_TITLE: 'Атрибут відв’язано',
        ATTRIBUTE_ASSIGN_ERROR_TITLE: 'Атрибут не оновлено',
        ATTRIBUTE_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз',
        TAG_ASSIGN_SUCCESS_TITLE: 'Тег прив’язано',
        TAG_UNASSIGN_SUCCESS_TITLE: 'Тег відв’язано',
        TAG_ASSIGN_ERROR_TITLE: 'Тег не оновлено',
        TAG_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз',
        IMAGES_ASSIGN_SUCCESS_TITLE: 'Зображення збережено',
        IMAGES_ASSIGN_ERROR_TITLE: 'Зображення не збережено',
        IMAGES_ASSIGN_ERROR_MESSAGE: 'Спробуйте ще раз',
        VARIATION_SAVE_SUCCESS_TITLE: 'Варіацію збережено',
        VARIATION_SAVE_ERROR_TITLE: 'Варіацію не збережено',
        VARIATION_SAVE_ERROR_MESSAGE: 'Спробуйте ще раз',
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads categories into facade state', () => {
    facade.loadCategories();

    expect(mockCategoriesService.getCategories).toHaveBeenCalledWith('shop-1');
    expect(facade.categoryItems()).toEqual([{ id: 'cat-1', name: 'Категорія 1' }]);
  });

  it('does not search tags when sidebar is disabled', () => {
    sidebarEnabled = false;
    facade.tagSearchResults.set([{ id: 'tag-1', label: 'Літо' }]);

    facade.onTagSearchChange('summer');

    expect(mockTagsService.getTags).not.toHaveBeenCalled();
    expect(facade.tagSearchResults()).toEqual([]);
  });

  it('assigns tag and updates assigned tags state', () => {
    facade.tagSearchResults.set([{ id: 'tag-2', label: 'Льон' }]);

    facade.onTagAssign('tag-2');

    expect(mockProductsService.toggleTag).toHaveBeenCalledWith('product-1', {
      tagId: 'tag-2',
      assign: true,
    });
    expect(facade.assignedTags()).toEqual([{ id: 'tag-2', label: 'Льон' }]);
    expect(mockToasterService.success).toHaveBeenCalledWith('Тег прив’язано');
  });

  it('calls image sort/remove endpoints and updates state on success', async () => {
    const imageFile = new File(['img'], 'img-1.jpg', { type: 'image/jpeg' });
    const imageFileSecond = new File(['img'], 'img-2.jpg', { type: 'image/jpeg' });
    vi.spyOn(facade as any, 'mapFilesToImageItems').mockResolvedValue([
      { id: 'img-1', name: 'img-1.jpg', imageDataUrl: 'data:image/jpeg;base64,Zm9v' },
      { id: 'img-2', name: 'img-2.jpg', imageDataUrl: 'data:image/jpeg;base64,YmFy' },
    ]);

    facade.onImageFilesSelected([imageFile, imageFileSecond]);
    await Promise.resolve();

    const firstId = facade.images()[0]?.id;
    const secondId = facade.images()[1]?.id;
    expect(facade.images()).toHaveLength(2);
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();

    facade.onImageMoveDown(firstId!);
    expect(mockProductsService.changeImageSort).toHaveBeenNthCalledWith(1, firstId, {
      direction: 'down',
    });
    expect(facade.images()[0].id).toBe(secondId);

    facade.onImageMoveUp(firstId!);
    expect(mockProductsService.changeImageSort).toHaveBeenNthCalledWith(2, firstId, {
      direction: 'up',
    });
    expect(facade.images()[0].id).toBe(firstId);

    facade.onImageRemove(firstId!);
    expect(mockProductsService.removeImage).toHaveBeenCalledWith(firstId);
    expect(facade.images()).toHaveLength(1);
  });

  it('keeps image order and shows error when sort request fails', () => {
    facade.images.set([
      { id: 'img-1', name: 'img-1.jpg', imageDataUrl: 'https://cdn.example.com/img-1.jpg' },
      { id: 'img-2', name: 'img-2.jpg', imageDataUrl: 'https://cdn.example.com/img-2.jpg' },
    ]);
    mockProductsService.changeImageSort.mockReturnValueOnce(throwError(() => new Error('Failed')));

    facade.onImageMoveDown('img-1');

    expect(facade.images().map((image) => image.id)).toEqual(['img-1', 'img-2']);
    expect(mockToasterService.danger).toHaveBeenCalledWith(
      'Зображення не збережено',
      'Спробуйте ще раз',
    );
  });

  it('keeps image in state and shows error when remove request fails', () => {
    facade.images.set([
      { id: 'img-1', name: 'img-1.jpg', imageDataUrl: 'https://cdn.example.com/img-1.jpg' },
    ]);
    mockProductsService.removeImage.mockReturnValueOnce(throwError(() => new Error('Failed')));

    facade.onImageRemove('img-1');

    expect(facade.images()).toHaveLength(1);
    expect(mockToasterService.danger).toHaveBeenCalledWith(
      'Зображення не збережено',
      'Спробуйте ще раз',
    );
  });

  it('uploads staged images only when requested', () => {
    facade.images.set([
      { id: 'img-1', name: 'img-1.jpg', imageDataUrl: 'data:image/jpeg;base64,Zm9v' },
      { id: 'img-2', name: 'img-2.jpg', imageDataUrl: 'data:image/jpeg;base64,YmFy' },
    ]);

    facade.uploadImages();

    expect(mockProductsService.assignImages).toHaveBeenCalledWith('product-1', {
      images: [
        { image: 'data:image/jpeg;base64,Zm9v', sort: 0 },
        { image: 'data:image/jpeg;base64,YmFy', sort: 1 },
      ],
    });
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
    expect(facade.images()).toEqual([
      {
        id: 'api-img-1',
        name: 'Image 1',
        imageDataUrl: 'https://cdn.example.com/img-1.jpg',
      },
    ]);
    expect(mockToasterService.success).toHaveBeenCalledWith('Зображення збережено');
  });

  it('saves new variation and shows success toast', () => {
    facade.variations.set([
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

    facade.saveVariation({ localId: 'variation-1' });

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
    expect(mockToasterService.success).toHaveBeenCalledWith('Варіацію збережено');
  });

  it('adds, updates and removes local variation state', () => {
    facade.onVariationAdd();
    const createdVariation = facade.variations()[0];

    expect(createdVariation).toBeTruthy();

    facade.onVariationChange({
      localId: createdVariation.localId,
      field: 'title',
      value: 'Синій M',
    });
    expect(facade.variations()[0].title).toBe('Синій M');

    facade.onVariationRemove({ localId: createdVariation.localId });
    expect(facade.variations()).toHaveLength(0);
  });

  it('updates existing variation through update endpoint', () => {
    facade.variations.set([
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

    facade.saveVariation({ localId: 'variation-1' });

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

  it('shows error toast when variation save fails', () => {
    mockProductsService.createVariation.mockReturnValueOnce(throwError(() => new Error('Failed')));
    facade.variations.set([
      {
        localId: 'variation-1',
        id: null,
        title: 'Синій M',
        name: 'Синій / M',
        price: '',
        oldPrice: '',
        sku: '',
        available: true,
        isMain: false,
        attributes: [],
        attributeSearchValue: '',
        attributeSearchResults: [],
        isAttributeSearchLoading: false,
        images: [],
        isSaving: false,
      },
    ]);

    facade.saveVariation({ localId: 'variation-1' });

    expect(mockToasterService.danger).toHaveBeenCalledWith(
      'Варіацію не збережено',
      'Спробуйте ще раз',
    );
  });
});
