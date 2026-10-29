import { Injectable, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ProductsService } from '../../../pages/products/services/products.service';
import { PRODUCT_FORM_SEARCH_DEBOUNCE_MS } from '../constants/product-form.constants';
import { ProductFormAssignableToggle } from '../models/product-form-assignable-toggle.model';
import { ProductFormOption } from '../models/product-form-option.model';
import { ProductFormAssignableSectionService } from './product-form-assignable-section.service';
import { ProductFormSearchService } from './product-form-search.service';

const TOAST_TEXTS = { ASSIGN_SUCCESS_TITLE: 'assigned', UNASSIGN_SUCCESS_TITLE: 'unassigned' };

@Injectable()
class TestAssignableService extends ProductFormAssignableSectionService {
  readonly searchSpy = vi
    .fn<(shopId: string, name: string) => Promise<ProductFormOption[]>>()
    .mockResolvedValue([{ id: 'item-1', label: 'Item 1' }]);
  readonly toggleSpy = vi
    .fn<(toggle: ProductFormAssignableToggle) => Observable<unknown>>()
    .mockReturnValue(of(undefined));

  protected readonly toastTexts = TOAST_TEXTS;

  protected searchItems(shopId: string, name: string): Promise<ProductFormOption[]> {
    return this.searchSpy(shopId, name);
  }

  protected toggleItem(toggle: ProductFormAssignableToggle): Observable<unknown> {
    return this.toggleSpy(toggle);
  }
}

/** TanStack notifies mutation callbacks through scheduled macrotasks. */
const flushAsync = async (): Promise<void> => {
  for (let tick = 0; tick < 5; tick++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

describe('ProductFormAssignableSectionService', () => {
  let service: TestAssignableService;
  let toaster: { success: ReturnType<typeof vi.fn> };
  let sidebarEnabled: boolean;
  let productId: string | null;

  beforeEach(() => {
    sidebarEnabled = true;
    productId = 'product-1';
    toaster = { success: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        TestAssignableService,
        { provide: ProductsService, useValue: {} },
        { provide: ProductFormSearchService, useValue: {} },
        { provide: ToasterService, useValue: toaster },
      ],
    });

    service = TestBed.inject(TestAssignableService);
    service.configure({
      getShopId: () => 'shop-1',
      getProductId: () => productId,
      isSidebarEnabled: () => sidebarEnabled,
    });
    // Runs the root effects that subscribe the mutation observers.
    TestBed.tick();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('search', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('debounces the search and stores the results', async () => {
      service.onSearchChange('it');
      service.onSearchChange('ite');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(service.searchSpy).toHaveBeenCalledTimes(1);
      expect(service.searchSpy).toHaveBeenCalledWith('shop-1', 'ite');
      expect(service.searchResults()).toEqual([{ id: 'item-1', label: 'Item 1' }]);
      expect(service.isSearchLoading()).toBe(false);
    });

    it('does not search while the sidebar is disabled', async () => {
      sidebarEnabled = false;
      service.searchResults.set([{ id: 'old', label: 'Old' }]);

      service.onSearchChange('ite');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(service.searchSpy).not.toHaveBeenCalled();
      expect(service.searchResults()).toEqual([]);
    });

    it('clears results for a blank search', async () => {
      service.searchResults.set([{ id: 'old', label: 'Old' }]);

      service.onSearchChange('   ');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(service.searchSpy).not.toHaveBeenCalled();
      expect(service.searchResults()).toEqual([]);
    });

    it('ignores a response that arrives after a newer search', async () => {
      let resolveFirst: (items: ProductFormOption[]) => void = () => undefined;
      service.searchSpy.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)));

      service.onSearchChange('first');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
      service.onSearchChange('second');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
      resolveFirst([{ id: 'stale', label: 'Stale' }]);
      await vi.advanceTimersByTimeAsync(0);

      expect(service.searchResults()).toEqual([{ id: 'item-1', label: 'Item 1' }]);
    });

    it('falls back to empty results when the search fails', async () => {
      service.searchSpy.mockRejectedValueOnce(new Error('boom'));

      service.onSearchChange('ite');
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(service.searchResults()).toEqual([]);
      expect(service.isSearchLoading()).toBe(false);
    });

    it('setAssignedItems resets the search and drops pending requests', async () => {
      service.onSearchChange('ite');
      service.setAssignedItems([{ id: 'a', label: 'A' }]);
      await vi.advanceTimersByTimeAsync(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);

      expect(service.searchSpy).not.toHaveBeenCalled();
      expect(service.searchValue()).toBe('');
      expect(service.assignedItems()).toEqual([{ id: 'a', label: 'A' }]);
    });
  });

  describe('assign / unassign', () => {
    it('assigns a search result, resets the search and toasts', async () => {
      service.searchValue.set('ite');
      service.searchResults.set([{ id: 'item-1', label: 'Item 1' }]);

      service.onAssign(' item-1 ');
      await flushAsync();

      expect(service.toggleSpy).toHaveBeenCalledWith({
        productId: 'product-1',
        itemId: 'item-1',
        assign: true,
      });
      expect(service.assignedItems()).toEqual([{ id: 'item-1', label: 'Item 1' }]);
      expect(service.searchValue()).toBe('');
      expect(toaster.success).toHaveBeenCalledWith(TOAST_TEXTS.ASSIGN_SUCCESS_TITLE);
      expect(service.isToggleLoading()).toBe(false);
    });

    it('ignores ids that are not in the search results', () => {
      service.onAssign('unknown');

      expect(service.toggleSpy).not.toHaveBeenCalled();
    });

    it('does not toggle without a product', () => {
      productId = null;
      service.searchResults.set([{ id: 'item-1', label: 'Item 1' }]);

      service.onAssign('item-1');

      expect(service.toggleSpy).not.toHaveBeenCalled();
    });

    it('unassigns an item and toasts', async () => {
      service.assignedItems.set([{ id: 'item-1', label: 'Item 1' }]);

      service.onUnassign('item-1');
      await flushAsync();

      expect(service.toggleSpy).toHaveBeenCalledWith({
        productId: 'product-1',
        itemId: 'item-1',
        assign: false,
      });
      expect(service.assignedItems()).toEqual([]);
      expect(toaster.success).toHaveBeenCalledWith(TOAST_TEXTS.UNASSIGN_SUCCESS_TITLE);
    });

    it('ignores blank ids on unassign', () => {
      service.onUnassign('  ');

      expect(service.toggleSpy).not.toHaveBeenCalled();
    });

    it('keeps the items when the toggle fails', async () => {
      service.toggleSpy.mockReturnValueOnce(throwError(() => new Error('boom')));
      service.assignedItems.set([{ id: 'item-1', label: 'Item 1' }]);

      service.onUnassign('item-1');
      await flushAsync();

      expect(service.assignedItems()).toEqual([{ id: 'item-1', label: 'Item 1' }]);
      expect(toaster.success).not.toHaveBeenCalled();
      expect(service.isToggleLoading()).toBe(false);
    });
  });
});
