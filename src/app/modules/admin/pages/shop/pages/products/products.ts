import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { areStringListsEqual, toggleListValue } from '@core/helpers/array/array.helper';
import {
  isPageChangeAllowed,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination/pagination.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { ConfirmModal } from '@ui/confirm-modal/confirm-modal';
import { isDropdownOptionValue } from '@ui/dropdown/helpers/dropdown-option.helper';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { FilterActions } from '@ui/filter-actions/filter-actions';
import { FilterBar } from '@ui/filter-bar/filter-bar';
import { FilterDropdown } from '@ui/filter-dropdown/filter-dropdown';
import { FilterInput } from '@ui/filter-input/filter-input';
import { MultiSelectDropdown } from '@ui/multi-select-dropdown/multi-select-dropdown';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { resolveTableRowId } from '@ui/table/helpers/table-row.helper';
import { TableRowData } from '@ui/table/models/table-column.model';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { extractCategoriesFromResponse } from '../../helpers/categories-response/categories-response.helper';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import { CategoriesService } from '../categories/services/categories/categories.service';
import {
  PRODUCTS_CATEGORY_FILTER_ICON,
  PRODUCTS_CREATE_ICON,
  PRODUCTS_CREATE_PATH,
  PRODUCTS_NAME_FILTER_ID,
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_SECTION_PATH,
  PRODUCTS_SKU_FILTER_ID,
  PRODUCTS_SORT_ICON,
  PRODUCTS_SORT_OPTIONS,
  PRODUCTS_TABLE_COLUMNS,
  PRODUCTS_TEXTS,
  PRODUCTS_UPDATE_PATH,
} from './constants/products.constants';
import {
  buildCategoryFilterOptions,
  mapProduct,
  resolveProductSortQuery,
} from './helpers/product-list-mapping/product-list-mapping.helper';
import { Product } from './models/product.model';
import { ProductSortValue } from './models/product-sort-value.type';
import { ProductsService } from './services/products/products.service';

@Component({
  selector: 'app-products',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    Button,
    StateMessage,
    FilterBar,
    FilterInput,
    FilterDropdown,
    FilterActions,
    MultiSelectDropdown,
    Table,
    Pagination,
    ConfirmModal,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = PRODUCTS_TEXTS;
  protected readonly createProductIcon = PRODUCTS_CREATE_ICON;
  protected readonly sortIcon = PRODUCTS_SORT_ICON;
  protected readonly categoryFilterIcon = PRODUCTS_CATEGORY_FILTER_ICON;
  protected readonly pageSize = PRODUCTS_PAGE_SIZE;
  protected readonly sortOptions = PRODUCTS_SORT_OPTIONS;
  protected readonly nameFilterId = PRODUCTS_NAME_FILTER_ID;
  protected readonly skuFilterId = PRODUCTS_SKU_FILTER_ID;
  protected readonly tableColumns = PRODUCTS_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly currentPage = linkedSignal({ source: this.shopId, computation: () => 1 });
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly selectedSort = signal<ProductSortValue>('newest');
  protected readonly nameInput = signal('');
  protected readonly skuInput = signal('');
  protected readonly categoryIdsInput = signal<string[]>([]);
  protected readonly nameFilter = signal('');
  protected readonly skuFilter = signal('');
  protected readonly categoryIdsFilter = signal<string[]>([]);

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), PRODUCTS_TEXTS.PAGE_TITLE),
  );

  protected readonly productsQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const sort = this.selectedSort();
    const name = this.nameFilter();
    const sku = this.skuFilter();
    const categoryIds = this.categoryIdsFilter();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.products(shopId, page, this.pageSize, sort, name, sku, categoryIds)
        : SHOP_QUERY_KEYS.disabled('products'),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.productsService.getProducts({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            ...resolveProductSortQuery(sort),
            ...(name ? { name } : {}),
            ...(sku ? { sku } : {}),
            ...(categoryIds.length ? { categoryIds } : {}),
          }),
        ),
    };
  });

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
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFilterDisabled = computed(
    () => !this.isShopContextReady() || this.isLoading(),
  );
  protected readonly isApplyDisabled = computed(
    () => this.isFilterDisabled() || this.isCategoriesLoading(),
  );
  protected readonly products = computed<Product[]>(() => {
    const shopId = this.shopId();
    return shopId
      ? (this.productsQuery.data()?.items ?? []).map((item) => mapProduct(item, shopId))
      : [];
  });
  protected readonly categoryOptions = computed(() =>
    buildCategoryFilterOptions(extractCategoriesFromResponse(this.categoriesQuery.data())),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.productsQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.productsQuery.data()));
  protected readonly isDeleteModalOpen = computed(() => Boolean(this.selectedProduct()));
  protected readonly productRows = computed<TableRowData[]>(() =>
    this.products().map(({ id, title, sku, type, status, price, categories }) => ({
      id,
      title,
      sku,
      type,
      status,
      price,
      categories,
    })),
  );

  protected onCategoryOptionToggled(option: DropdownOption): void {
    this.categoryIdsInput.update((current) => toggleListValue(current, option.value));
  }

  protected onSortSelected(option: DropdownOption): void {
    if (
      !isDropdownOptionValue<ProductSortValue>(option.value, this.sortOptions) ||
      option.value === this.selectedSort()
    ) {
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
      areStringListsEqual(nextCategoryFilter, this.categoryIdsFilter())
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
    if (shopId) {
      this.router.navigate([
        APP_ROUTES.ADMIN_SHOP,
        shopId,
        PRODUCTS_SECTION_PATH,
        PRODUCTS_CREATE_PATH,
      ]);
    }
  }

  protected onUpdateProduct(row: TableRowData): void {
    const shopId = this.shopId();
    const productId = resolveTableRowId(row);
    if (shopId && productId) {
      this.router.navigate([
        APP_ROUTES.ADMIN_SHOP,
        shopId,
        PRODUCTS_SECTION_PATH,
        productId,
        PRODUCTS_UPDATE_PATH,
      ]);
    }
  }

  protected onDeleteProduct(row: TableRowData): void {
    const productId = resolveTableRowId(row);
    const product = this.products().find((item) => item.id === productId);
    if (product) {
      this.selectedProduct.set(product);
    }
  }

  protected onCloseDeleteModal(): void {
    if (!this.isActionLoading()) {
      this.selectedProduct.set(null);
    }
  }

  protected onConfirmDelete(): void {
    const selectedProduct = this.selectedProduct();
    if (!selectedProduct || this.isActionLoading()) {
      return;
    }

    this.deleteProductMutation.mutate(selectedProduct.id, {
      onSuccess: () => {
        this.selectedProduct.set(null);
        const shopId = this.shopId();
        if (shopId) {
          this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.productsScope(shopId) });
        }
      },
    });
  }

  protected onPageChange(page: number): void {
    if (isPageChangeAllowed(page, this.currentPage(), this.totalPages())) {
      this.currentPage.set(page);
    }
  }
}
