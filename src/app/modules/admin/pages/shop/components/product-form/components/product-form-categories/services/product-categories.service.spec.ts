import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { CategoriesService } from '../../../../../pages/categories/services/categories.service';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { PRODUCT_FORM_TOAST_TEXTS } from '../../../constants/product-form.constants';
import { ProductCategoriesService } from './product-categories.service';

/** TanStack notifies mutation callbacks through scheduled macrotasks. */
const flushAsync = async (): Promise<void> => {
  for (let tick = 0; tick < 5; tick++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;
  let getCategories: ReturnType<typeof vi.fn>;
  let toggleCategory: ReturnType<typeof vi.fn>;
  let toaster: { success: ReturnType<typeof vi.fn> };
  let shopId: string | null;
  let sidebarEnabled: boolean;

  beforeEach(() => {
    shopId = 'shop-1';
    sidebarEnabled = true;
    getCategories = vi.fn().mockReturnValue(
      of([
        { id: 'cat-1', name: 'Clothes' },
        { id: 'cat-2', name: 'Shoes', parentId: 'cat-1' },
      ]),
    );
    toggleCategory = vi.fn().mockReturnValue(of(undefined));
    toaster = { success: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductCategoriesService,
        { provide: ProductsService, useValue: { toggleCategory } },
        { provide: CategoriesService, useValue: { getCategories } },
        { provide: ToasterService, useValue: toaster },
      ],
    });

    service = TestBed.inject(ProductCategoriesService);
    service.configure({
      getShopId: () => shopId,
      getProductId: () => 'product-1',
      isSidebarEnabled: () => sidebarEnabled,
    });
    // Runs the root effects that subscribe the mutation observers.
    TestBed.tick();
  });

  describe('loadCategories', () => {
    it('loads the category tree of the shop', async () => {
      service.loadCategories();
      await vi.waitFor(() => expect(service.isCategoriesLoading()).toBe(false));

      expect(getCategories).toHaveBeenCalledWith('shop-1');
      expect(service.categoryItems().map((item) => item.id)).toEqual(['cat-1', 'cat-2']);
      expect(service.categoryNodes()[0].children?.[0].id).toBe('cat-2');
    });

    it('clears the categories without a shop', () => {
      shopId = null;
      service.categoryItems.set([{ id: 'old' }]);

      service.loadCategories();

      expect(getCategories).not.toHaveBeenCalled();
      expect(service.categoryItems()).toEqual([]);
    });

    it('falls back to an empty list when loading fails', async () => {
      getCategories.mockReturnValueOnce(throwError(() => new Error('boom')));

      service.loadCategories();
      await vi.waitFor(() => expect(service.isCategoriesLoading()).toBe(false));

      expect(service.categoryItems()).toEqual([]);
    });
  });

  describe('onCategoryToggle', () => {
    it('assigns the category, refreshes caches and toasts', async () => {
      service.onCategoryToggle({ categoryId: ' cat-1 ', checked: true });

      expect(service.selectedCategoryIds().has('cat-1')).toBe(true);
      await flushAsync();

      expect(toggleCategory).toHaveBeenCalledWith('product-1', {
        categoryId: 'cat-1',
        assign: true,
      });
      expect(toaster.success).toHaveBeenCalledWith(
        PRODUCT_FORM_TOAST_TEXTS.CATEGORY_ASSIGN_SUCCESS_TITLE,
      );
      expect(service.isCategoryToggleLoading()).toBe(false);
    });

    it('unassigns the category with the unassign toast', async () => {
      service.setSelectedCategoryIds(new Set(['cat-1']));

      service.onCategoryToggle({ categoryId: 'cat-1', checked: false });
      await flushAsync();

      expect(service.selectedCategoryIds().has('cat-1')).toBe(false);
      expect(toaster.success).toHaveBeenCalledWith(
        PRODUCT_FORM_TOAST_TEXTS.CATEGORY_UNASSIGN_SUCCESS_TITLE,
      );
    });

    it('rolls the checkbox back when the request fails', async () => {
      toggleCategory.mockReturnValueOnce(throwError(() => new Error('boom')));

      service.onCategoryToggle({ categoryId: 'cat-1', checked: true });
      await flushAsync();

      expect(service.selectedCategoryIds().has('cat-1')).toBe(false);
      expect(toaster.success).not.toHaveBeenCalled();
    });

    it('ignores toggles while disabled or for blank ids', () => {
      service.onCategoryToggle({ categoryId: ' ', checked: true });
      sidebarEnabled = false;
      service.onCategoryToggle({ categoryId: 'cat-1', checked: true });

      expect(toggleCategory).not.toHaveBeenCalled();
      expect(service.selectedCategoryIds().size).toBe(0);
    });
  });

  it('setSelectedCategoryIds copies the given set', () => {
    const ids = new Set(['cat-1']);

    service.setSelectedCategoryIds(ids);
    ids.add('cat-2');

    expect(service.selectedCategoryIds()).toEqual(new Set(['cat-1']));
  });
});
