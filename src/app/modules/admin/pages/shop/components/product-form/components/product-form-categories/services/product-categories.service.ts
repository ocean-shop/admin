import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { SHOP_QUERY_KEYS } from '../../../../../constants/shop-query-keys.constants';
import { extractCategoriesFromResponse } from '../../../../../helpers/categories-response.helper';
import {
  buildProductCategoryTreeNodes,
  updateSelectedCategoryIds,
} from '../../../../../helpers/product-category-tree.helper';
import { CategoryApiItem } from '../../../../../pages/categories/models/category.model';
import { CategoriesService } from '../../../../../pages/categories/services/categories.service';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormCategoryNode } from '../../../models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../../../models/product-form-category-toggle-event.model';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductCategoriesToastTexts } from '../models/product-categories-toast-texts.model';

@Injectable()
export class ProductCategoriesService {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly queryClient = injectQueryClient();
  private readonly toasterService = inject(ToasterService);

  private readonly toggleCategoryMutation = injectMutation(() => ({
    mutationFn: (payload: { productId: string; categoryId: string; assign: boolean }) =>
      lastValueFrom(
        this.productsService.toggleCategory(payload.productId, {
          categoryId: payload.categoryId,
          assign: payload.assign,
        }),
      ),
  }));

  private context: ProductFormEditorContext | null = null;
  private getToastTexts: () => ProductCategoriesToastTexts = () => {
    throw new Error('ProductCategoriesService is not configured.');
  };

  readonly isCategoriesLoading = signal(false);
  readonly isCategoryToggleLoading = signal(false);
  readonly categoryItems = signal<CategoryApiItem[]>([]);
  readonly selectedCategoryIds = signal<Set<string>>(new Set());

  readonly categoryNodes = computed<ProductFormCategoryNode[]>(() =>
    buildProductCategoryTreeNodes(this.categoryItems(), this.selectedCategoryIds(), {
      disabled: this.isCategoriesLoading() || this.isCategoryToggleLoading(),
    }),
  );

  configure(
    context: ProductFormEditorContext,
    getToastTexts: () => ProductCategoriesToastTexts,
  ): void {
    this.context = context;
    this.getToastTexts = getToastTexts;
  }

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
      .then((response) => {
        this.categoryItems.set(extractCategoriesFromResponse(response));
      })
      .catch(() => {
        this.categoryItems.set([]);
        this.toasterService.danger(
          this.getToastTexts().CATEGORIES_LOAD_ERROR_TITLE,
          this.getToastTexts().CATEGORIES_LOAD_ERROR_MESSAGE,
        );
      })
      .finally(() => {
        this.isCategoriesLoading.set(false);
      });
  }

  onCategoryToggle(event: ProductFormCategoryToggleEvent): void {
    if (!this.isSidebarEnabled() || this.isCategoryToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const categoryId = event.categoryId.trim();
    if (!categoryId) {
      return;
    }

    this.selectedCategoryIds.update((currentValue) =>
      updateSelectedCategoryIds(currentValue, categoryId, event.checked),
    );

    this.isCategoryToggleLoading.set(true);
    this.toggleCategoryMutation.mutate(
      { productId, categoryId, assign: event.checked },
      {
        onSuccess: () => {
          this.toasterService.success(
            event.checked
              ? this.getToastTexts().CATEGORY_ASSIGN_SUCCESS_TITLE
              : this.getToastTexts().CATEGORY_UNASSIGN_SUCCESS_TITLE,
          );
        },
        onError: () => {
          this.selectedCategoryIds.update((currentValue) =>
            updateSelectedCategoryIds(currentValue, categoryId, !event.checked),
          );
          this.toasterService.danger(
            this.getToastTexts().CATEGORY_ASSIGN_ERROR_TITLE,
            this.getToastTexts().CATEGORY_ASSIGN_ERROR_MESSAGE,
          );
        },
        onSettled: () => {
          this.isCategoryToggleLoading.set(false);
        },
      },
    );
  }

  private getShopId(): string | null {
    return this.requireContext().getShopId()?.trim() || null;
  }

  private getProductId(): string | null {
    return this.requireContext().getProductId()?.trim() || null;
  }

  private isSidebarEnabled(): boolean {
    return this.requireContext().isSidebarEnabled();
  }

  private requireContext(): ProductFormEditorContext {
    if (!this.context) {
      throw new Error('ProductCategoriesService is not configured.');
    }

    return this.context;
  }
}
