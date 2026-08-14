import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Modal } from '@ui/modal/modal';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildTree } from '../../helpers/tree.helper';
import { TreeNode } from '../../models/tree-node.model';
import { CategoryFormModal } from './components/category-form-modal/category-form-modal';
import { CATEGORIES_CREATE_ICON, CATEGORIES_TEXTS } from './constants/categories.constants';
import { CategoryModalMode, CategoryModalModeEnum } from './models/category-modal-mode.type';
import {
  CategoriesApiResponse,
  CategoriesStats,
  Category,
  CategoryApiItem,
} from './models/category.model';
import {
  CategoryFormSubmitPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from './models/category-payload.model';
import { CategoryTreeNode, VisibleCategoryNode } from './models/category-tree.model';
import { CategorySortDirection } from './models/change-category-sort.model';
import { CategoriesService } from './services/categories.service';

@Component({
  selector: 'app-categories',
  imports: [CategoryFormModal, Modal],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = CATEGORIES_TEXTS;
  protected readonly createIcon = CATEGORIES_CREATE_ICON;
  protected readonly expandedCategoryIds = signal<Set<string>>(new Set());
  protected readonly selectedCategory = signal<Category | null>(null);
  protected readonly selectedParentCategory = signal<Category | null>(null);
  protected readonly modalMode = signal<CategoryModalMode>(null);
  protected readonly shopId = signal<string | null>(null);
  private readonly editCategoryId = signal<string | null>(null);

  protected readonly categoriesQuery = injectQuery(() => {
    const shopId = this.shopId();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.categories(shopId)
        : ['shop', 'categories', 'missing-shop-id'],
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.categoriesService.getCategories(shopId ?? '')),
    };
  });

  protected readonly editCategoryQuery = injectQuery(() => {
    const categoryId = this.editCategoryId();
    return {
      queryKey: categoryId
        ? ['shop', 'categories', 'detail', categoryId]
        : ['shop', 'categories', 'detail', 'missing-id'],
      enabled: Boolean(categoryId),
      queryFn: () => lastValueFrom(this.categoriesService.getCategoryById(categoryId ?? '')),
    };
  });

  protected readonly createCategoryMutation = injectMutation(() => ({
    mutationFn: (payload: CreateCategoryPayload) =>
      lastValueFrom(this.categoriesService.createCategory(payload)),
  }));

  protected readonly updateCategoryMutation = injectMutation(() => ({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      lastValueFrom(this.categoriesService.updateCategory(id, payload)),
  }));

  protected readonly deleteCategoryMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.categoriesService.deleteCategory(id)),
  }));

  protected readonly changeSortMutation = injectMutation(() => ({
    mutationFn: ({ id, direction }: { id: string; direction: CategorySortDirection }) =>
      lastValueFrom(this.categoriesService.changeCategorySort(id, { direction })),
  }));

  protected readonly isLoading = computed(
    () => this.categoriesQuery.isPending() || this.categoriesQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.categoriesQuery.isError());
  protected readonly isActionLoading = computed(
    () =>
      (Boolean(this.editCategoryId()) && this.editCategoryQuery.isPending()) ||
      this.createCategoryMutation.isPending() ||
      this.updateCategoryMutation.isPending() ||
      this.deleteCategoryMutation.isPending() ||
      this.changeSortMutation.isPending(),
  );
  protected readonly categories = computed<Category[]>(() =>
    this.extractCategories(this.categoriesQuery.data() ?? []).map((category) =>
      this.mapCategory(category),
    ),
  );
  protected readonly stats = computed<CategoriesStats>(() =>
    this.resolveStats(this.categoriesQuery.data() ?? []),
  );
  protected readonly hasCategories = computed(() => this.categories().length > 0);
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly hasVisibleStats = computed(() => {
    const stats = this.stats();
    return typeof stats.totalCategories === 'number' || typeof stats.deepestLevel === 'number';
  });
  protected readonly hasProductCounts = computed(() =>
    this.categories().some((category) => typeof category.productCount === 'number'),
  );
  protected readonly categoryTree = computed(() => this.buildTree(this.categories()));
  protected readonly visibleNodes = computed(() =>
    this.flattenTree(this.categoryTree(), this.expandedCategoryIds()),
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

  constructor() {
    effect(() => {
      const category = this.editCategoryQuery.data();
      const categoryId = this.editCategoryId();
      if (!category || !categoryId) {
        return;
      }

      const mapped = this.mapCategory(category);
      this.selectedCategory.set(mapped);
      this.selectedParentCategory.set(
        mapped.parentId
          ? (this.categories().find((item) => item.id === mapped.parentId) ?? null)
          : null,
      );
      this.modalMode.set(CategoryModalModeEnum.Update);
      this.editCategoryId.set(null);
    });
  }

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onCreateRootCategory(): void {
    if (!this.isShopContextReady()) {
      return;
    }

    this.selectedCategory.set(null);
    this.selectedParentCategory.set(null);
    this.modalMode.set(CategoryModalModeEnum.CreateRoot);
  }

  protected onCreateChildCategory(node: VisibleCategoryNode): void {
    if (!this.isShopContextReady()) {
      return;
    }

    this.selectedCategory.set(null);
    this.selectedParentCategory.set(node.category);
    this.modalMode.set(CategoryModalModeEnum.CreateChild);
  }

  protected onEditCategory(node: VisibleCategoryNode): void {
    if (this.isActionLoading()) {
      return;
    }

    this.editCategoryId.set(node.category.id);
  }

  protected onDeleteCategory(node: VisibleCategoryNode): void {
    this.selectedCategory.set(node.category);
    this.selectedParentCategory.set(null);
    this.modalMode.set(CategoryModalModeEnum.Delete);
  }

  protected onToggleNode(node: VisibleCategoryNode): void {
    if (!node.hasChildren) {
      return;
    }

    this.expandedCategoryIds.update((currentValue) => {
      const nextValue = new Set(currentValue);
      if (nextValue.has(node.category.id)) {
        nextValue.delete(node.category.id);
      } else {
        nextValue.add(node.category.id);
      }

      return nextValue;
    });
  }

  protected onCloseModal(): void {
    if (this.isActionLoading()) {
      return;
    }

    this.closeModal();
  }

  protected onConfirmCreate(payload: CategoryFormSubmitPayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const mode = this.modalMode();
    const currentShopId = this.shopId();
    if (!currentShopId) {
      return;
    }

    if (mode === CategoryModalModeEnum.CreateRoot || mode === CategoryModalModeEnum.CreateChild) {
      const createPayload: CreateCategoryPayload = {
        shopId: currentShopId,
        name: payload.name,
        slug: payload.slug,
        ...(payload.parentId ? { parentId: payload.parentId } : {}),
      };
      this.executeMutation(
        this.createCategoryMutation,
        createPayload,
        CATEGORIES_TEXTS.CREATE_SUCCESS_TITLE,
      );
    }
  }

  protected onConfirmUpdate(payload: CategoryFormSubmitPayload): void {
    const selectedCategory = this.selectedCategory();
    if (!selectedCategory || this.isActionLoading()) {
      return;
    }

    const updatePayload: UpdateCategoryPayload = {
      name: payload.name,
      slug: payload.slug,
      ...(payload.parentId ? { parentId: payload.parentId } : {}),
    };
    this.executeMutation(
      this.updateCategoryMutation,
      { id: selectedCategory.id, payload: updatePayload },
      CATEGORIES_TEXTS.UPDATE_SUCCESS_TITLE,
    );
  }

  protected onConfirmDelete(): void {
    const selectedCategory = this.selectedCategory();
    if (!selectedCategory || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.deleteCategoryMutation,
      selectedCategory.id,
      CATEGORIES_TEXTS.DELETE_SUCCESS_TITLE,
    );
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

  private watchShopId(): void {
    const initialShopId = this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null;
    this.shopId.set(initialShopId);
    this.initializeExpandedNodes();

    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        this.initializeExpandedNodes();
      });
  }

  private executeMutation<T>(
    mutation: {
      mutate: (payload: T, options?: { onSuccess?: () => void }) => void;
    },
    payload: T,
    successTitle: string,
  ): void {
    mutation.mutate(payload, {
      onSuccess: () => {
        this.toasterService.success(successTitle);
        this.closeModal();
        this.invalidateCategories();
      },
    });
  }

  private invalidateCategories(): void {
    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: SHOP_QUERY_KEYS.categories(shopId),
    });
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedCategory.set(null);
    this.selectedParentCategory.set(null);
  }

  private resolveStats(response: CategoriesApiResponse | CategoryApiItem[]): CategoriesStats {
    if (Array.isArray(response)) {
      return {};
    }

    return {
      ...(typeof response.totalCategories === 'number'
        ? { totalCategories: response.totalCategories }
        : {}),
      ...(typeof response.deepestLevel === 'number' ? { deepestLevel: response.deepestLevel } : {}),
    };
  }

  private extractCategories(
    response: CategoriesApiResponse | CategoryApiItem[],
  ): CategoryApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.items ?? response.categories ?? response.data ?? [];
  }

  private mapCategory(category: CategoryApiItem): Category {
    const productCount =
      category.productCount ?? category.productsCount ?? category.itemsCount ?? undefined;

    return {
      id: String(category.id ?? crypto.randomUUID()),
      ...(category.parentId ? { parentId: String(category.parentId) } : {}),
      name: (category.name ?? '').trim() || 'Untitled category',
      slug: (category.slug ?? '').trim() || 'category',
      sort: typeof category.sort === 'number' ? category.sort : 0,
      ...(typeof productCount === 'number' ? { productCount } : {}),
    };
  }

  private initializeExpandedNodes(): void {
    this.expandedCategoryIds.set(new Set());
  }

  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const tree = buildTree(categories, {
      getId: (category) => category.id,
      getParentId: (category) => category.parentId?.trim(),
      compareSiblings: (left, right) => {
        const sortDiff = left.sort - right.sort;
        if (sortDiff !== 0) {
          return sortDiff;
        }

        return left.id.localeCompare(right.id);
      },
    });

    return tree.map((node) => this.mapCategoryTreeNode(node));
  }

  private mapCategoryTreeNode(node: TreeNode<Category>): CategoryTreeNode {
    return {
      category: node.value,
      children: node.children.map((childNode) => this.mapCategoryTreeNode(childNode)),
    };
  }

  private flattenTree(tree: CategoryTreeNode[], expandedIds: Set<string>): VisibleCategoryNode[] {
    const flattened: VisibleCategoryNode[] = [];
    const visited = new Set<string>();

    tree.forEach((node, index) =>
      this.appendNode(flattened, node, 0, expandedIds, visited, index, tree.length),
    );

    return flattened;
  }

  private appendNode(
    output: VisibleCategoryNode[],
    node: CategoryTreeNode,
    depth: number,
    expandedIds: Set<string>,
    visited: Set<string>,
    siblingIndex: number,
    siblingCount: number,
  ): void {
    if (visited.has(node.category.id)) {
      return;
    }

    visited.add(node.category.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.category.id);

    output.push({
      category: node.category,
      depth,
      hasChildren,
      isExpanded,
      canMoveUp: siblingIndex > 0,
      canMoveDown: siblingIndex < siblingCount - 1,
    });

    if (!hasChildren || !isExpanded) {
      return;
    }

    node.children.forEach((childNode, index) =>
      this.appendNode(
        output,
        childNode,
        depth + 1,
        expandedIds,
        visited,
        index,
        node.children.length,
      ),
    );
  }
}
