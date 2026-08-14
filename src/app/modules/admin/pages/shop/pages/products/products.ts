import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Modal } from '@ui/modal/modal';
import { DropdownTreeOption } from '@ui/multi-select-dropdown/models/dropdown-tree-option.type';
import { MultiSelectDropdown } from '@ui/multi-select-dropdown/multi-select-dropdown';
import { Pagination } from '@ui/pagination/pagination';
import { Table } from '@ui/table/table';
import { TableColumn, TableRowData } from '@ui/table/models/table-column.model';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildTree, flattenTree } from '../../helpers/tree.helper';
import { CategoriesApiResponse, CategoryApiItem } from '../categories/models/category.model';
import { CategoriesService } from '../categories/services/categories.service';
import {
  PRODUCTS_CREATE_ICON,
  PRODUCTS_NAME_FILTER_ID,
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_SKU_FILTER_ID,
  PRODUCTS_SORT_OPTIONS,
  PRODUCTS_TEXTS,
} from './constants/products.constants';
import { Product, ProductApiItem, ProductListQueryParams } from './models/product.model';
import { ProductSortValue } from './models/product-sort-value.type';
import { ProductStatus } from './models/product-status.enum';
import { ProductType } from './models/product-type.enum';
import { ProductsService } from './services/products.service';

@Component({
  selector: 'app-products',
  imports: [Button, Dropdown, MultiSelectDropdown, Pagination, Table, Modal],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = PRODUCTS_TEXTS;
  protected readonly createProductIcon = PRODUCTS_CREATE_ICON;
  protected readonly pageSize = PRODUCTS_PAGE_SIZE;
  protected readonly sortOptions = PRODUCTS_SORT_OPTIONS;
  protected readonly nameFilterId = PRODUCTS_NAME_FILTER_ID;
  protected readonly skuFilterId = PRODUCTS_SKU_FILTER_ID;
  protected readonly tableColumns: TableColumn[] = [
    { key: 'title', header: PRODUCTS_TEXTS.TABLE_TITLE_HEADER },
    { key: 'sku', header: PRODUCTS_TEXTS.TABLE_SKU_HEADER },
    { key: 'type', header: PRODUCTS_TEXTS.TABLE_TYPE_HEADER },
    { key: 'status', header: PRODUCTS_TEXTS.TABLE_STATUS_HEADER },
    { key: 'price', header: PRODUCTS_TEXTS.TABLE_PRICE_HEADER, align: 'right' },
    { key: 'categories', header: PRODUCTS_TEXTS.TABLE_CATEGORIES_HEADER },
  ];

  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly shopId = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly selectedSort = signal<ProductSortValue>('newest');
  protected readonly nameInput = signal('');
  protected readonly skuInput = signal('');
  protected readonly categoryIdsInput = signal<string[]>([]);
  protected readonly nameFilter = signal('');
  protected readonly skuFilter = signal('');
  protected readonly categoryIdsFilter = signal<string[]>([]);

  protected readonly productsQuery = injectQuery(() => {
    const shopId = this.shopId();
    const categoryIds = this.categoryIdsFilter();
    const query: ProductListQueryParams = {
      page: this.currentPage(),
      limit: this.pageSize,
      shopId: shopId ?? '',
      ...this.resolveSortQuery(this.selectedSort()),
      ...(this.nameFilter() ? { name: this.nameFilter() } : {}),
      ...(this.skuFilter() ? { sku: this.skuFilter() } : {}),
      ...(categoryIds.length ? { categoryIds } : {}),
    };

    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.products(
            shopId,
            query.page,
            query.limit,
            this.selectedSort(),
            this.nameFilter(),
            this.skuFilter(),
            categoryIds,
          )
        : ['shop', 'products', 'missing-shop-id'],
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.productsService.getProducts(query)),
    };
  });

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

  protected readonly deleteProductMutation = injectMutation(() => ({
    mutationFn: (productId: string) => lastValueFrom(this.productsService.deleteProduct(productId)),
  }));

  protected readonly isLoading = computed(
    () => this.productsQuery.isPending() || this.productsQuery.isFetching(),
  );
  protected readonly isCategoriesLoading = computed(
    () => this.categoriesQuery.isPending() || this.categoriesQuery.isFetching(),
  );
  protected readonly hasError = computed(
    () => this.productsQuery.isError() || this.deleteProductMutation.isError(),
  );
  protected readonly isActionLoading = computed(() => this.deleteProductMutation.isPending());
  protected readonly products = computed<Product[]>(() => {
    const shopId = this.shopId();
    const items = this.productsQuery.data()?.items ?? [];
    if (!shopId) {
      return [];
    }

    return items.map((item) => this.mapProduct(item, shopId));
  });
  protected readonly categoryOptions = computed<DropdownTreeOption[]>(() => {
    const categories = this.extractCategories(this.categoriesQuery.data() ?? []);
    return this.buildCategoryTreeOptions(categories);
  });
  protected readonly totalItems = computed(() =>
    Math.max(0, this.productsQuery.data()?.total ?? 0),
  );
  protected readonly totalPages = computed(() =>
    Math.max(1, this.productsQuery.data()?.totalPages ?? 1),
  );
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isDeleteModalOpen = computed(() => Boolean(this.selectedProduct()));
  protected readonly productRows = computed<TableRowData[]>(() =>
    this.products().map((product) => ({
      id: product.id,
      title: product.title,
      sku: product.sku,
      type: product.type,
      status: product.status,
      price: product.price,
      categories: product.categories,
    })),
  );

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onNameInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.nameInput.set(target?.value ?? '');
  }

  protected onSkuInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.skuInput.set(target?.value ?? '');
  }

  protected onCategoryOptionToggled(option: DropdownOption): void {
    this.categoryIdsInput.update((current) => {
      if (current.includes(option.value)) {
        return current.filter((value) => value !== option.value);
      }

      return [...current, option.value];
    });
  }

  protected onSortSelected(option: DropdownOption): void {
    if (!this.isValidSortValue(option.value) || option.value === this.selectedSort()) {
      return;
    }

    this.selectedSort.set(option.value);
    this.currentPage.set(1);
  }

  protected onApplyFilters(): void {
    const nextNameFilter = this.nameInput().trim();
    const nextSkuFilter = this.skuInput().trim();
    const nextCategoryFilter = [...this.categoryIdsInput()].sort();

    if (
      nextNameFilter === this.nameFilter() &&
      nextSkuFilter === this.skuFilter() &&
      this.areArraysEqual(nextCategoryFilter, this.categoryIdsFilter())
    ) {
      return;
    }

    this.nameFilter.set(nextNameFilter);
    this.skuFilter.set(nextSkuFilter);
    this.categoryIdsFilter.set(nextCategoryFilter);
    this.currentPage.set(1);
  }

  protected onResetFilters(): void {
    const hasAppliedFilters =
      Boolean(this.nameFilter()) ||
      Boolean(this.skuFilter()) ||
      this.categoryIdsFilter().length > 0;
    this.nameInput.set('');
    this.skuInput.set('');
    this.categoryIdsInput.set([]);

    if (!hasAppliedFilters) {
      return;
    }

    this.nameFilter.set('');
    this.skuFilter.set('');
    this.categoryIdsFilter.set([]);
    this.currentPage.set(1);
  }

  protected onCreateProduct(): void {
    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    this.router.navigate(['/admin/shop', shopId, 'products', 'create']);
  }

  protected onUpdateProduct(row: TableRowData): void {
    const shopId = this.shopId();
    const productId = this.resolveProductId(row);
    if (!shopId || !productId) {
      return;
    }

    this.router.navigate(['/admin/shop', shopId, 'products', productId, 'update']);
  }

  protected onDeleteProduct(row: TableRowData): void {
    const productId = this.resolveProductId(row);
    if (!productId) {
      return;
    }

    const product = this.products().find((item) => item.id === productId);
    if (!product) {
      return;
    }

    this.selectedProduct.set(product);
  }

  protected onCloseDeleteModal(): void {
    if (this.deleteProductMutation.isPending()) {
      return;
    }

    this.selectedProduct.set(null);
  }

  protected onConfirmDelete(): void {
    const selectedProduct = this.selectedProduct();
    if (!selectedProduct || this.deleteProductMutation.isPending()) {
      return;
    }

    this.deleteProductMutation.mutate(selectedProduct.id, {
      onSuccess: () => {
        const shopId = this.shopId();
        this.selectedProduct.set(null);
        if (!shopId) {
          return;
        }

        this.queryClient.invalidateQueries({
          queryKey: ['shop', shopId, 'products'],
        });
      },
    });
  }

  protected onPageChange(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  private watchShopId(): void {
    const initialShopId = this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null;
    this.shopId.set(initialShopId);
    this.currentPage.set(1);

    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        this.currentPage.set(1);
      });
  }

  private resolveSortQuery(
    sort: ProductSortValue,
  ): Pick<ProductListQueryParams, 'sortBy' | 'sortOrder'> {
    if (sort === 'older') {
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    }

    if (sort === 'alphabet') {
      return { sortBy: 'name', sortOrder: 'asc' };
    }

    return { sortBy: 'createdAt', sortOrder: 'desc' };
  }

  private mapCategoryToOption(category: CategoryApiItem): DropdownOption | null {
    const id = String(category.id ?? '').trim();
    if (!id) {
      return null;
    }

    const parentId = String(category.parentId ?? '').trim();

    return {
      value: id,
      label: category.name?.trim() || `Category ${id}`,
      parentId: parentId && parentId !== id ? parentId : undefined,
    };
  }

  private buildCategoryTreeOptions(categories: CategoryApiItem[]): DropdownTreeOption[] {
    const categoryOptions = categories
      .map((category) => this.mapCategoryToOption(category))
      .filter((option): option is DropdownOption => Boolean(option));

    const tree = buildTree(categoryOptions, {
      getId: (option) => option.value,
      getParentId: (option) => option.parentId?.trim(),
      compareSiblings: (left, right) => left.label.localeCompare(right.label),
    });

    return flattenTree(
      tree,
      (option) => option.value,
      (option, level) => ({
        ...option,
        level,
      }),
    );
  }

  private extractCategories(
    response: CategoriesApiResponse | CategoryApiItem[],
  ): CategoryApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.items)) {
      return response.items;
    }

    if (Array.isArray(response.categories)) {
      return response.categories;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  private mapProduct(product: ProductApiItem, fallbackShopId: string): Product {
    const title = product.title?.trim() || product.name?.trim() || 'Untitled product';
    const categories = this.resolveCategoryNames(product.categories);

    return {
      id: product.id?.trim() || crypto.randomUUID(),
      shopId: product.shopId?.trim() || fallbackShopId,
      title,
      sku: this.resolveSkuLabel(product.sku),
      type: this.resolveTypeLabel(product.type),
      status: this.resolveStatusLabel(product.status),
      price: this.resolvePriceLabel(product.price),
      categories: categories.length ? categories.join(', ') : '—',
    };
  }

  private resolveCategoryNames(categories: ProductApiItem['categories']): string[] {
    const entries = categories ?? [];

    return entries
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }

        return entry.name?.trim() || '';
      })
      .filter(Boolean);
  }

  private resolveTypeLabel(type: ProductApiItem['type']): string {
    const normalized = String(type ?? '')
      .trim()
      .toLowerCase();
    if (normalized === ProductType.Simple) {
      return 'Simple';
    }

    if (normalized === ProductType.Variable) {
      return 'Variable';
    }

    return normalized ? this.toCapitalizedLabel(normalized) : '—';
  }

  private resolveStatusLabel(status: ProductApiItem['status']): string {
    const normalized = String(status ?? '')
      .trim()
      .toLowerCase();
    if (normalized === ProductStatus.Active) {
      return 'Active';
    }

    if (normalized === ProductStatus.Draft) {
      return 'Draft';
    }

    if (normalized === ProductStatus.Archived) {
      return 'Archived';
    }

    return normalized ? this.toCapitalizedLabel(normalized) : '—';
  }

  private resolvePriceLabel(price: ProductApiItem['price']): string {
    if (typeof price === 'number' && Number.isFinite(price)) {
      return price.toFixed(2);
    }

    if (typeof price === 'string') {
      const normalized = price.trim();
      return normalized || '—';
    }

    return '—';
  }

  private resolveSkuLabel(sku: ProductApiItem['sku']): string {
    return sku?.trim() || '—';
  }

  private toCapitalizedLabel(value: string): string {
    return value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  private areArraysEqual(left: string[], right: string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((value, index) => value === right[index]);
  }

  private isValidSortValue(value: string): value is ProductSortValue {
    return value === 'newest' || value === 'older' || value === 'alphabet';
  }

  private resolveProductId(row: TableRowData): string | null {
    const productId = row['id'];
    if (typeof productId === 'string') {
      const normalizedProductId = productId.trim();
      return normalizedProductId || null;
    }

    if (typeof productId === 'number') {
      return String(productId);
    }

    return null;
  }
}
