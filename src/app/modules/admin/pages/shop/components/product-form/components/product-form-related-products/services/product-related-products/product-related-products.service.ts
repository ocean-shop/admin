import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { moveItemByOffset } from '@core/helpers/array/array.helper';
import { createDebouncedScheduler } from '@core/helpers/debounced-scheduler/debounced-scheduler.helper';
import { SHOP_QUERY_KEYS } from '../../../../../../constants/shop-query-keys.constants';
import {
  PRODUCT_FORM_RELATED_PRODUCTS_MAX,
  PRODUCT_FORM_RELATED_PRODUCTS_QUERY_SCOPE,
  PRODUCT_FORM_RELATED_PRODUCTS_SEARCH_KEY,
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_TOAST_TEXTS,
} from '../../../../constants/product-form.constants';
import { ImageSortOffset } from '../../../../models/image-sort-offset.type';
import { ProductFormRelatedProduct } from '../../../../models/product-form-related-product.model';
import { ProductFormSearchService } from '../../../../services/product-form-search/product-form-search.service';
import { ProductFormSectionService } from '../../../../services/product-form-section/product-form-section.service';
import {
  excludeRelatedProducts,
  mapRelatedProducts,
} from '../../helpers/related-product-mapping/related-product-mapping.helper';
import { RelatedProductsSaveOptions } from '../../models/related-products-save-options.model';
import { SaveRelatedProductsMutationPayload } from '../../models/save-related-products-mutation-payload.model';

/**
 * Ordered related products of the edited product. The API replaces the whole list,
 * so every add / remove / move sends the full id list and renders the response.
 */
@Injectable()
export class ProductRelatedProductsService extends ProductFormSectionService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchService = inject(ProductFormSearchService);
  private readonly searchScheduler = createDebouncedScheduler(PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
  private readonly rawSearchResults = signal<ProductFormRelatedProduct[]>([]);

  readonly searchValue = signal('');
  readonly isSearchLoading = signal(false);
  readonly isSaving = signal(false);

  private readonly relatedQuery = injectQuery(() => {
    const productId = this.getActiveProductId();
    return {
      queryKey: productId
        ? SHOP_QUERY_KEYS.relatedProducts(productId)
        : SHOP_QUERY_KEYS.disabled(PRODUCT_FORM_RELATED_PRODUCTS_QUERY_SCOPE),
      enabled: !!productId,
      queryFn: () => lastValueFrom(this.productsService.getRelatedProducts(productId ?? '')),
    };
  });

  private readonly saveMutation = injectMutation(() => ({
    mutationFn: ({ productId, productIds }: SaveRelatedProductsMutationPayload) =>
      lastValueFrom(this.productsService.assignRelatedProducts(productId, { productIds })),
  }));

  readonly items = computed(() => mapRelatedProducts(this.relatedQuery.data()));
  readonly isLoading = computed(() => this.relatedQuery.isLoading());
  readonly isLimitReached = computed(
    () => this.items().length >= PRODUCT_FORM_RELATED_PRODUCTS_MAX,
  );
  /** Search hits minus the edited product and products that are already related. */
  readonly searchResults = computed(() => {
    const excludedIds = new Set(this.items().map((item) => item.id));
    const productId = this.getActiveProductId();
    if (productId) {
      excludedIds.add(productId);
    }

    return excludeRelatedProducts(this.rawSearchResults(), excludedIds);
  });

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.searchScheduler.cancelAll());
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    if (!this.isSidebarEnabled() || this.isLimitReached()) {
      this.cancelSearch();
      this.rawSearchResults.set([]);
      return;
    }

    this.queueSearch();
  }

  onAdd(relatedId: string): void {
    const id = relatedId.trim();
    if (!id || this.isLimitReached() || !this.searchResults().some((item) => item.id === id)) {
      return;
    }

    this.save({
      productIds: [...this.currentIds(), id],
      successTitle: PRODUCT_FORM_TOAST_TEXTS.RELATED_PRODUCT_ADD_SUCCESS_TITLE,
      onSaved: () => this.resetSearch(),
    });
  }

  onRemove(relatedId: string): void {
    const id = relatedId.trim();
    const ids = this.currentIds();
    if (!ids.includes(id)) {
      return;
    }

    this.save({
      productIds: ids.filter((currentId) => currentId !== id),
      successTitle: PRODUCT_FORM_TOAST_TEXTS.RELATED_PRODUCT_REMOVE_SUCCESS_TITLE,
    });
  }

  onMoveUp(relatedId: string): void {
    this.move(relatedId, -1);
  }

  onMoveDown(relatedId: string): void {
    this.move(relatedId, 1);
  }

  private move(relatedId: string, offset: ImageSortOffset): void {
    const ids = this.currentIds();
    const id = relatedId.trim();
    const nextIds = moveItemByOffset(ids, (currentId) => currentId === id, offset);
    if (nextIds === ids) {
      return;
    }

    this.save({
      productIds: nextIds,
      successTitle: PRODUCT_FORM_TOAST_TEXTS.RELATED_PRODUCTS_SORT_SUCCESS_TITLE,
    });
  }

  private save({ productIds, successTitle, onSaved }: RelatedProductsSaveOptions): void {
    const productId = this.getProductId();
    if (!productId || !this.isSidebarEnabled() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.saveMutation.mutate(
      { productId, productIds },
      {
        onSuccess: (related) => {
          const queryKey = SHOP_QUERY_KEYS.relatedProducts(productId);
          this.queryClient.setQueryData(queryKey, related);
          void this.queryClient.invalidateQueries({ queryKey });
          onSaved?.();
          this.toasterService.success(successTitle);
        },
        onSettled: () => this.isSaving.set(false),
      },
    );
  }

  /** The product id once the host has configured the service and the sidebar is usable. */
  private getActiveProductId(): string | null {
    return this.isConfigured() && this.isSidebarEnabled() ? this.getProductId() : null;
  }

  private currentIds(): string[] {
    return this.items().map((item) => item.id);
  }

  private queueSearch(): void {
    const shopId = this.getShopId();
    const sku = this.searchValue().trim();
    if (!shopId || !sku) {
      this.cancelSearch();
      this.rawSearchResults.set([]);
      return;
    }

    this.searchScheduler.schedule(PRODUCT_FORM_RELATED_PRODUCTS_SEARCH_KEY, (isLatest) =>
      this.loadSearchResults(shopId, sku, isLatest),
    );
  }

  private loadSearchResults(shopId: string, sku: string, isLatest: () => boolean): void {
    this.isSearchLoading.set(true);
    void this.searchService
      .searchProductsBySku(shopId, sku)
      .then(mapRelatedProducts)
      .catch((): ProductFormRelatedProduct[] => [])
      .then((results) => {
        if (isLatest()) {
          this.rawSearchResults.set(results);
          this.isSearchLoading.set(false);
        }
      });
  }

  private resetSearch(): void {
    this.cancelSearch();
    this.searchValue.set('');
    this.rawSearchResults.set([]);
  }

  private cancelSearch(): void {
    this.searchScheduler.cancel(PRODUCT_FORM_RELATED_PRODUCTS_SEARCH_KEY);
    this.isSearchLoading.set(false);
  }
}
