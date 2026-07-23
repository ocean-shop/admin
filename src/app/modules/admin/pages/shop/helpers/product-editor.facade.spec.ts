import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { of } from 'rxjs';
import { AttributesService } from '../pages/attributes/services/attributes.service';
import { CategoriesService } from '../pages/categories/services/categories.service';
import { ProductsService } from '../pages/products/services/products.service';
import { TagsService } from '../pages/tags/services/tags.service';
import { ProductEditorFacade } from '../facades/product-editor.facade';

describe('ProductEditorFacade', () => {
  let facade: ProductEditorFacade;
  let mockProductsService: {
    toggleCategory: ReturnType<typeof vi.fn>;
    toggleAttribute: ReturnType<typeof vi.fn>;
    toggleTag: ReturnType<typeof vi.fn>;
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
      toggleCategory: vi.fn().mockReturnValue(of({})),
      toggleAttribute: vi.fn().mockReturnValue(of({})),
      toggleTag: vi.fn().mockReturnValue(of({})),
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
});
