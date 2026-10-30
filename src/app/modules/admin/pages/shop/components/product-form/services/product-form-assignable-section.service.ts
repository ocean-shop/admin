import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom, Observable } from 'rxjs';
import { createDebouncedScheduler } from '@core/helpers/debounced-scheduler/debounced-scheduler.helper';
import {
  removeProductFormOption,
  upsertProductFormOption,
} from '../../../helpers/product-search-results.helper';
import {
  PRODUCT_FORM_ASSIGNABLE_SEARCH_KEY,
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
} from '../constants/product-form.constants';
import { ProductFormAssignableToggle } from '../models/product-form-assignable-toggle.model';
import { ProductFormAssignableToastTexts } from '../models/product-form-assignable-toast-texts.model';
import { ProductFormOption } from '../models/product-form-option.model';
import { ProductFormSearchService } from './product-form-search.service';
import { ProductFormSectionService } from './product-form-section.service';

/**
 * Debounced search + assign/unassign flow shared by tags and attributes.
 * Subclasses only describe how to search and how to toggle one item.
 */
@Injectable()
export abstract class ProductFormAssignableSectionService extends ProductFormSectionService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchScheduler = createDebouncedScheduler(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
  protected readonly searchService = inject(ProductFormSearchService);

  readonly searchValue = signal('');
  readonly searchResults = signal<ProductFormOption[]>([]);
  readonly isSearchLoading = signal(false);
  readonly isToggleLoading = signal(false);
  readonly assignedItems = signal<ProductFormOption[]>([]);

  private readonly toggleMutation = injectMutation(() => ({
    mutationFn: (toggle: ProductFormAssignableToggle) => lastValueFrom(this.toggleItem(toggle)),
  }));

  protected abstract readonly toastTexts: ProductFormAssignableToastTexts;

  protected abstract searchItems(shopId: string, name: string): Promise<ProductFormOption[]>;

  protected abstract toggleItem(toggle: ProductFormAssignableToggle): Observable<unknown>;

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.searchScheduler.cancelAll());
  }

  setAssignedItems(items: ProductFormOption[]): void {
    this.assignedItems.set(items);
    this.resetSearch();
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    if (!this.isSidebarEnabled()) {
      this.searchResults.set([]);
      return;
    }

    this.queueSearch();
  }

  onAssign(itemId: string): void {
    const id = itemId.trim();
    const option = this.searchResults().find((result) => result.id === id);
    if (!option) {
      return;
    }

    this.toggle(id, true, () => {
      this.assignedItems.update((items) => upsertProductFormOption(items, option));
      this.resetSearch();
      this.toasterService.success(this.toastTexts.ASSIGN_SUCCESS_TITLE);
    });
  }

  onUnassign(itemId: string): void {
    const id = itemId.trim();
    if (!id) {
      return;
    }

    this.toggle(id, false, () => {
      this.assignedItems.update((items) => removeProductFormOption(items, id));
      this.toasterService.success(this.toastTexts.UNASSIGN_SUCCESS_TITLE);
    });
  }

  private toggle(itemId: string, assign: boolean, onToggled: () => void): void {
    const productId = this.getProductId();
    if (!productId || !this.isSidebarEnabled() || this.isToggleLoading()) {
      return;
    }

    this.isToggleLoading.set(true);
    this.toggleMutation.mutate(
      { productId, itemId, assign },
      {
        onSuccess: () => {
          this.invalidateProductQueries(productId);
          onToggled();
        },
        onSettled: () => this.isToggleLoading.set(false),
      },
    );
  }

  private queueSearch(): void {
    const shopId = this.getShopId();
    const name = this.searchValue().trim();
    if (!shopId || !name) {
      this.cancelSearch();
      this.searchResults.set([]);
      return;
    }

    this.searchScheduler.schedule(PRODUCT_FORM_ASSIGNABLE_SEARCH_KEY, (isLatest) =>
      this.loadSearchResults(shopId, name, isLatest),
    );
  }

  private loadSearchResults(shopId: string, name: string, isLatest: () => boolean): void {
    this.isSearchLoading.set(true);
    void this.searchItems(shopId, name)
      .catch((): ProductFormOption[] => [])
      .then((results) => {
        if (isLatest()) {
          this.searchResults.set(results);
          this.isSearchLoading.set(false);
        }
      });
  }

  private resetSearch(): void {
    this.cancelSearch();
    this.searchValue.set('');
    this.searchResults.set([]);
  }

  private cancelSearch(): void {
    this.searchScheduler.cancel(PRODUCT_FORM_ASSIGNABLE_SEARCH_KEY);
    this.isSearchLoading.set(false);
  }
}
