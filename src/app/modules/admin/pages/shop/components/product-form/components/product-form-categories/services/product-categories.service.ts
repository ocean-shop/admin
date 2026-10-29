import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { SHOP_QUERY_KEYS } from '../../../../../constants/shop-query-keys.constants';
import { extractCategoriesFromResponse } from '../../../../../helpers/categories-response.helper';
import {
  buildProductCategoryTreeNodes,
  updateSelectedCategoryIds,
} from '../../../../../helpers/product-category-tree.helper';
import { CategoryApiItem } from '../../../../../pages/categories/models/category.model';
import { CategoriesService } from '../../../../../pages/categories/services/categories.service';
import { PRODUCT_FORM_TOAST_TEXTS } from '../../../constants/product-form.constants';
import { ProductFormCategoryToggleEvent } from '../../../models/product-form-category-toggle-event.model';
import { ProductFormSectionService } from '../../../services/product-form-section.service';
import { ProductToggleCategoryMutationPayload } from '../models/product-toggle-category-mutation-payload.model';

@Injectable()
export class ProductCategoriesService extends ProductFormSectionService {
  private readonly categoriesService = inject(CategoriesService);

  private readonly toggleCategoryMutation = injectMutation(() => ({
    mutationFn: ({ productId, categoryId, assign }: ProductToggleCategoryMutationPayload) =>
      lastValueFrom(this.productsService.toggleCategory(productId, { categoryId, assign })),
  }));

  readonly isCategoriesLoading = signal(false);
  readonly isCategoryToggleLoading = signal(false);
  readonly categoryItems = signal<CategoryApiItem[]>([]);
  readonly selectedCategoryIds = signal<Set<string>>(new Set());

  readonly categoryNodes = computed(() =>
    buildProductCategoryTreeNodes(this.categoryItems(), this.selectedCategoryIds(), {
      disabled: this.isCategoriesLoading() || this.isCategoryToggleLoading(),
    }),
  );

  setSelectedCategoryIds(selectedCategoryIds: Set<string>): void {
    this.selectedCategoryIds.set(new Set(selectedCategoryIds));
  }

  loadCategories(): void {
    const shopId = this.getShopId();
    if (!shopId) {
      this.categoryItems.set([]);
      return;
    }

    this.isCategoriesLoading.set(true);
    this.queryClient
      .fetchQuery({
        queryKey: SHOP_QUERY_KEYS.categories(shopId),
        queryFn: () => lastValueFrom(this.categoriesService.getCategories(shopId)),
      })
      .then((response) => this.categoryItems.set(extractCategoriesFromResponse(response)))
      .catch(() => this.categoryItems.set([]))
      .finally(() => this.isCategoriesLoading.set(false));
  }

  /** Optimistic toggle: the checkbox flips immediately and is rolled back on failure. */
  onCategoryToggle({ categoryId: rawCategoryId, checked }: ProductFormCategoryToggleEvent): void {
    const productId = this.getProductId();
    const categoryId = rawCategoryId.trim();
    if (!productId || !categoryId || !this.isSidebarEnabled() || this.isCategoryToggleLoading()) {
      return;
    }

    this.setCategoryChecked(categoryId, checked);
    this.isCategoryToggleLoading.set(true);
    this.toggleCategoryMutation.mutate(
      { productId, categoryId, assign: checked },
      {
        onSuccess: () => {
          this.invalidateProductQueries(productId);
          this.toasterService.success(
            checked
              ? PRODUCT_FORM_TOAST_TEXTS.CATEGORY_ASSIGN_SUCCESS_TITLE
              : PRODUCT_FORM_TOAST_TEXTS.CATEGORY_UNASSIGN_SUCCESS_TITLE,
          );
        },
        onError: () => this.setCategoryChecked(categoryId, !checked),
        onSettled: () => this.isCategoryToggleLoading.set(false),
      },
    );
  }

  private setCategoryChecked(categoryId: string, checked: boolean): void {
    this.selectedCategoryIds.update((ids) => updateSelectedCategoryIds(ids, categoryId, checked));
  }
}
