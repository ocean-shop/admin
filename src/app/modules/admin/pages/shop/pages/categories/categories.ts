import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize, map, Observable } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Modal } from '@ui/modal/modal';
import { CategoryFormModal } from './components/category-form-modal/category-form-modal';
import { CATEGORIES_CREATE_ICON, CATEGORIES_TEXTS } from './constants/categories.constants';
import { buildTree } from '../../helpers/tree.helper';
import { TreeNode } from '../../models/tree-node.model';
import { CategorySortDirection } from './models/change-category-sort.model';
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

  protected readonly textData = CATEGORIES_TEXTS;
  protected readonly createIcon = CATEGORIES_CREATE_ICON;

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly isActionLoading = signal(false);
  protected readonly categories = signal<Category[]>([]);
  protected readonly expandedCategoryIds = signal<Set<string>>(new Set());
  protected readonly selectedCategory = signal<Category | null>(null);
  protected readonly selectedParentCategory = signal<Category | null>(null);
  protected readonly modalMode = signal<CategoryModalMode>(null);
  protected readonly shopId = signal<string | null>(null);
  protected readonly stats = signal<CategoriesStats>({});

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

    this.isActionLoading.set(true);
    this.categoriesService
      .getCategoryById(node.category.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isActionLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          const category = this.mapCategory(response);
          this.selectedCategory.set(category);
          this.selectedParentCategory.set(
            category.parentId
              ? (this.categories().find((item) => item.id === category.parentId) ?? null)
              : null,
          );
          this.modalMode.set(CategoryModalModeEnum.Update);
        },
      });
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
        this.categoriesService.createCategory(createPayload),
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
      this.categoriesService.updateCategory(selectedCategory.id, updatePayload),
      CATEGORIES_TEXTS.UPDATE_SUCCESS_TITLE,
    );
  }

  protected onConfirmDelete(): void {
    const selectedCategory = this.selectedCategory();
    if (!selectedCategory || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.categoriesService.deleteCategory(selectedCategory.id),
      CATEGORIES_TEXTS.DELETE_SUCCESS_TITLE,
    );
  }

  protected onChangeSort(node: VisibleCategoryNode, direction: CategorySortDirection): void {
    const canMove = direction === 'up' ? node.canMoveUp : node.canMoveDown;
    if (!canMove || this.isActionLoading()) {
      return;
    }

    this.isActionLoading.set(true);
    this.categoriesService
      .changeCategorySort(node.category.id, { direction })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isActionLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(CATEGORIES_TEXTS.SORT_SUCCESS_TITLE);
          this.loadCategories({ preserveExpanded: true });
        },
      });
  }

  private watchShopId(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        if (!shopId) {
          this.categories.set([]);
          this.stats.set({});
          this.initializeExpandedNodes();
          this.isLoading.set(false);
          return;
        }

        this.loadCategories();
      });
  }

  private loadCategories(options?: { preserveExpanded?: boolean }): void {
    const currentShopId = this.shopId();
    if (!currentShopId) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.categoriesService
      .getCategories(currentShopId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          const categories = this.extractCategories(response).map((category) =>
            this.mapCategory(category),
          );
          this.categories.set(categories);
          this.stats.set(this.resolveStats(response));
          if (!options?.preserveExpanded) {
            this.initializeExpandedNodes();
          }
        },
        error: () => {
          this.hasError.set(true);
        },
      });
  }

  private executeMutation(request$: Observable<unknown>, successTitle: string): void {
    this.isActionLoading.set(true);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isActionLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(successTitle);
          this.closeModal();
          this.loadCategories();
        },
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
