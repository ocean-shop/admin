import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { toggleSetValue } from '@core/helpers/array/array.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { ConfirmModal } from '@ui/confirm-modal/confirm-modal';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { extractCategoriesFromResponse } from '../../helpers/categories-response/categories-response.helper';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import { CategoryFormModal } from './components/category-form-modal/category-form-modal';
import {
  CATEGORIES_CREATE_ICON,
  CATEGORIES_ICONS,
  CATEGORIES_TEXTS,
  CATEGORIES_TREE_INDENT_PX,
} from './constants/categories.constants';
import {
  buildCategoryTree,
  flattenVisibleCategoryNodes,
  mapCategory,
  resolveCategoriesStats,
} from './helpers/category-mapping/category-mapping.helper';
import { CategoryModalMode, CategoryModalModeEnum } from './models/category-modal-mode.type';
import { Category } from './models/category.model';
import {
  CategoryFormSubmitPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryVariables,
} from './models/category-payload.model';
import { VisibleCategoryNode } from './models/category-tree.model';
import {
  CategorySortDirection,
  ChangeCategorySortVariables,
} from './models/change-category-sort.model';
import { CategoriesService } from './services/categories/categories.service';

@Component({
  selector: 'app-categories',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    Button,
    StateMessage,
    CategoryFormModal,
    ConfirmModal,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private readonly categoriesService = inject(CategoriesService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = CATEGORIES_TEXTS;
  protected readonly createIcon = CATEGORIES_CREATE_ICON;
  protected readonly icons = CATEGORIES_ICONS;
  protected readonly treeIndentPx = CATEGORIES_TREE_INDENT_PX;

  protected readonly shopId = injectRouteParam('shopId');
  /** Nodes are expanded by default; the whole tree is re-expanded whenever the shop changes. */
  protected readonly collapsedCategoryIds = linkedSignal<string | null, Set<string>>({
    source: this.shopId,
    computation: () => new Set(),
  });
  protected readonly selectedCategory = signal<Category | null>(null);
  protected readonly selectedParentCategory = signal<Category | null>(null);
  protected readonly modalMode = signal<CategoryModalMode>(null);
  protected readonly isEditLoading = signal(false);

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), CATEGORIES_TEXTS.PAGE_TITLE),
  );

  protected readonly categoriesQuery = injectQuery(() => {
    const shopId = this.shopId();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.categories(shopId)
        : SHOP_QUERY_KEYS.disabled('categories'),
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.categoriesService.getCategories(shopId ?? '')),
    };
  });

  protected readonly createCategoryMutation = injectMutation(() => ({
    mutationFn: (payload: CreateCategoryPayload) =>
      lastValueFrom(this.categoriesService.createCategory(payload)),
  }));

  protected readonly updateCategoryMutation = injectMutation(() => ({
    mutationFn: ({ id, payload }: UpdateCategoryVariables) =>
      lastValueFrom(this.categoriesService.updateCategory(id, payload)),
  }));

  protected readonly deleteCategoryMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.categoriesService.deleteCategory(id)),
  }));

  protected readonly changeSortMutation = injectMutation(() => ({
    mutationFn: ({ id, direction }: ChangeCategorySortVariables) =>
      lastValueFrom(this.categoriesService.changeCategorySort(id, { direction })),
  }));

  protected readonly isLoading = computed(
    () => this.categoriesQuery.isPending() || this.categoriesQuery.isFetching(),
  );
  protected readonly isActionLoading = computed(
    () =>
      this.isEditLoading() ||
      this.createCategoryMutation.isPending() ||
      this.updateCategoryMutation.isPending() ||
      this.deleteCategoryMutation.isPending() ||
      this.changeSortMutation.isPending(),
  );
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly categories = computed<Category[]>(() =>
    extractCategoriesFromResponse(this.categoriesQuery.data()).map(mapCategory),
  );
  protected readonly stats = computed(() => resolveCategoriesStats(this.categoriesQuery.data()));
  protected readonly hasCategories = computed(() => this.categories().length > 0);
  protected readonly hasVisibleStats = computed(() => {
    const { totalCategories, deepestLevel } = this.stats();
    return totalCategories !== undefined || deepestLevel !== undefined;
  });
  protected readonly hasProductCounts = computed(() =>
    this.categories().some((category) => category.productCount !== undefined),
  );
  protected readonly visibleNodes = computed(() =>
    flattenVisibleCategoryNodes(buildCategoryTree(this.categories()), this.collapsedCategoryIds()),
  );
  protected readonly isFormModalOpen = computed(() => {
    const mode = this.modalMode();
    return mode === CategoryModalModeEnum.CreateRoot || mode === CategoryModalModeEnum.CreateChild;
  });
  protected readonly isUpdateModalOpen = computed(
    () => this.modalMode() === CategoryModalModeEnum.Update,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === CategoryModalModeEnum.Delete,
  );

  protected onCreateRootCategory(): void {
    if (this.isShopContextReady()) {
      this.openModal(CategoryModalModeEnum.CreateRoot, null, null);
    }
  }

  protected onCreateChildCategory(node: VisibleCategoryNode): void {
    if (this.isShopContextReady()) {
      this.openModal(CategoryModalModeEnum.CreateChild, null, node.category);
    }
  }

  /** Loads the full category (the list omits SEO fields) before opening the edit modal. */
  protected onEditCategory(node: VisibleCategoryNode): void {
    if (this.isActionLoading()) {
      return;
    }

    const categoryId = node.category.id;
    this.isEditLoading.set(true);
    this.queryClient
      .fetchQuery({
        queryKey: SHOP_QUERY_KEYS.categoryById(categoryId),
        queryFn: () => lastValueFrom(this.categoriesService.getCategoryById(categoryId)),
      })
      .then((category) => {
        const mapped = mapCategory(category);
        const parent = this.categories().find((item) => item.id === mapped.parentId) ?? null;
        this.openModal(CategoryModalModeEnum.Update, mapped, parent);
      })
      .catch(() => undefined)
      .finally(() => this.isEditLoading.set(false));
  }

  protected onDeleteCategory(node: VisibleCategoryNode): void {
    this.openModal(CategoryModalModeEnum.Delete, node.category, null);
  }

  protected onToggleNode(node: VisibleCategoryNode): void {
    if (node.hasChildren) {
      this.collapsedCategoryIds.update((ids) => toggleSetValue(ids, node.category.id));
    }
  }

  protected onCloseModal(): void {
    if (!this.isActionLoading()) {
      this.closeModal();
    }
  }

  protected onConfirmCreate(payload: CategoryFormSubmitPayload): void {
    const shopId = this.shopId();
    if (!shopId || !this.isFormModalOpen() || this.isActionLoading()) {
      return;
    }

    const { parentId, ...categoryFields } = payload;
    const createPayload: CreateCategoryPayload = {
      shopId,
      ...categoryFields,
      ...(parentId ? { parentId } : {}),
    };
    this.createCategoryMutation.mutate(createPayload, {
      onSuccess: () => this.onMutationSuccess(CATEGORIES_TEXTS.CREATE_SUCCESS_TITLE),
    });
  }

  protected onConfirmUpdate(payload: CategoryFormSubmitPayload): void {
    const selectedCategory = this.selectedCategory();
    if (!selectedCategory || this.isActionLoading()) {
      return;
    }

    const { parentId, ...categoryFields } = payload;
    const updatePayload: UpdateCategoryPayload = {
      ...categoryFields,
      ...(parentId ? { parentId } : {}),
    };
    this.updateCategoryMutation.mutate(
      { id: selectedCategory.id, payload: updatePayload },
      { onSuccess: () => this.onMutationSuccess(CATEGORIES_TEXTS.UPDATE_SUCCESS_TITLE) },
    );
  }

  protected onConfirmDelete(): void {
    const selectedCategory = this.selectedCategory();
    if (!selectedCategory || this.isActionLoading()) {
      return;
    }

    this.deleteCategoryMutation.mutate(selectedCategory.id, {
      onSuccess: () => this.onMutationSuccess(CATEGORIES_TEXTS.DELETE_SUCCESS_TITLE),
    });
  }

  protected onChangeSort(node: VisibleCategoryNode, direction: CategorySortDirection): void {
    const canMove = direction === 'up' ? node.canMoveUp : node.canMoveDown;
    if (!canMove || this.isActionLoading()) {
      return;
    }

    this.changeSortMutation.mutate(
      { id: node.category.id, direction },
      {
        onSuccess: () => {
          this.toasterService.success(CATEGORIES_TEXTS.SORT_SUCCESS_TITLE);
          this.invalidateCategories();
        },
      },
    );
  }

  private onMutationSuccess(successTitle: string): void {
    this.toasterService.success(successTitle);
    this.closeModal();
    this.invalidateCategories();
  }

  private invalidateCategories(): void {
    const shopId = this.shopId();
    if (shopId) {
      this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.categories(shopId) });
    }
  }

  private openModal(
    mode: CategoryModalMode,
    category: Category | null,
    parentCategory: Category | null,
  ): void {
    this.selectedCategory.set(category);
    this.selectedParentCategory.set(parentCategory);
    this.modalMode.set(mode);
  }

  private closeModal(): void {
    this.openModal(null, null, null);
  }
}
