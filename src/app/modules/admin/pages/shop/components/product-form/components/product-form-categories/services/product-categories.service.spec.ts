import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { CategoriesService } from '../../../../../pages/categories/services/categories.service';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductCategoriesToastTexts } from '../models/product-categories-toast-texts.model';
import { ProductCategoriesService } from './product-categories.service';

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;
  let mockCategoriesService: {
    getCategories: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };

  const context: ProductFormEditorContext = {
    getShopId: () => 'shop-1',
    getProductId: () => 'product-1',
    isSidebarEnabled: () => true,
  };
  const toastTexts: ProductCategoriesToastTexts = {
    CATEGORIES_LOAD_ERROR_TITLE: 'load error',
    CATEGORIES_LOAD_ERROR_MESSAGE: 'load error message',
    CATEGORY_ASSIGN_SUCCESS_TITLE: 'assigned',
    CATEGORY_UNASSIGN_SUCCESS_TITLE: 'unassigned',
    CATEGORY_ASSIGN_ERROR_TITLE: 'assign error',
    CATEGORY_ASSIGN_ERROR_MESSAGE: 'assign error message',
  };

  beforeEach(() => {
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(
        of([
          { id: 'cat-1', name: 'Clothes' },
          { id: 'cat-2', name: 'Shoes', parentId: 'cat-1' },
        ]),
      ),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductCategoriesService,
        {
          provide: ProductsService,
          useValue: { toggleCategory: vi.fn().mockReturnValue(of(void 0)) },
        },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    });

    service = TestBed.inject(ProductCategoriesService);
    service.configure(context, () => toastTexts);
  });

  it('loads categories into service state', async () => {
    service.loadCategories();
    await vi.waitFor(() => {
      expect(service.isCategoriesLoading()).toBe(false);
    });

    expect(mockCategoriesService.getCategories).toHaveBeenCalledWith('shop-1');
    expect(service.categoryItems().map((item) => item.id)).toEqual(['cat-1', 'cat-2']);
  });

  it('toggles category and keeps selection on success', () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; categoryId: string; assign: boolean },
        options?: { onSuccess?: () => void; onSettled?: () => void },
      ) => {
        options?.onSuccess?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleCategoryMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleCategoryMutation = { mutate: mutateSpy };

    service.onCategoryToggle({ categoryId: 'cat-1', checked: true });

    expect(mutateSpy).toHaveBeenCalledWith(
      { productId: 'product-1', categoryId: 'cat-1', assign: true },
      expect.any(Object),
    );
    expect(Array.from(service.selectedCategoryIds())).toContain('cat-1');
    expect(mockToasterService.success).toHaveBeenCalledWith('assigned');
  });

  it('rolls back selected category and shows error toast on failure', () => {
    const mutateSpy = vi.fn(
      (
        _payload: { productId: string; categoryId: string; assign: boolean },
        options?: { onError?: () => void; onSettled?: () => void },
      ) => {
        options?.onError?.();
        options?.onSettled?.();
      },
    );
    (
      service as unknown as {
        toggleCategoryMutation: {
          mutate: typeof mutateSpy;
        };
      }
    ).toggleCategoryMutation = { mutate: mutateSpy };

    service.onCategoryToggle({ categoryId: 'cat-1', checked: true });

    expect(Array.from(service.selectedCategoryIds())).not.toContain('cat-1');
    expect(mockToasterService.danger).toHaveBeenCalledWith('assign error', 'assign error message');
    expect(service.isCategoryToggleLoading()).toBe(false);
  });
});
