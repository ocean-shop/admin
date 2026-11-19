import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { forkJoin, lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import {
  isPageChangeAllowed,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination/pagination.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Badge } from '@ui/badge/badge';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { FilterActions } from '@ui/filter-actions/filter-actions';
import { FilterBar } from '@ui/filter-bar/filter-bar';
import { FilterInput } from '@ui/filter-input/filter-input';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import {
  PRODUCTS_SECTION_PATH,
  PRODUCTS_UPDATE_PATH,
} from '../products/constants/products.constants';
import { QuickOrdersTable } from './components/quick-orders-table/quick-orders-table';
import {
  QUICK_ORDER_STATUS_SUCCESS_TITLES,
  QUICK_ORDERS_COUNT_LIMIT,
  QUICK_ORDERS_DEFAULT_TAB,
  QUICK_ORDERS_PAGE_SIZE,
  QUICK_ORDERS_SEARCH_FILTER_ID,
  QUICK_ORDERS_TABS,
  QUICK_ORDERS_TEXTS,
} from './constants/quick-orders.constants';
import {
  applyQuickOrderStatusChange,
  buildQuickOrderCounts,
  buildQuickOrderTabViews,
  mapQuickOrder,
  normalizeQuickOrderSearch,
  resolveQuickOrderTabStatus,
} from './helpers/quick-order-mapping/quick-order-mapping.helper';
import { QuickOrderListResponse } from './models/quick-order.model';
import { QuickOrderTab } from './models/quick-order-tab.type';
import { UpdateQuickOrderStatusVariables } from './models/update-quick-order-status-variables.model';
import { QuickOrdersService } from './services/quick-orders/quick-orders.service';

@Component({
  selector: 'app-quick-orders',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    FilterBar,
    FilterInput,
    FilterActions,
    Badge,
    QuickOrdersTable,
    Pagination,
  ],
  templateUrl: './quick-orders.html',
  styleUrl: './quick-orders.scss',
})
export class QuickOrders {
  private readonly quickOrdersService = inject(QuickOrdersService);
  private readonly toasterService = inject(ToasterService);
  private readonly router = inject(Router);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = QUICK_ORDERS_TEXTS;
  protected readonly pageSize = QUICK_ORDERS_PAGE_SIZE;
  protected readonly searchFilterId = QUICK_ORDERS_SEARCH_FILTER_ID;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly activeTab = linkedSignal<string | null, QuickOrderTab>({
    source: this.shopId,
    computation: () => QUICK_ORDERS_DEFAULT_TAB,
  });
  protected readonly currentPage = linkedSignal({
    source: () => [this.shopId(), this.activeTab()],
    computation: () => 1,
  });
  protected readonly searchInput = signal('');
  protected readonly searchFilter = signal('');

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), QUICK_ORDERS_TEXTS.PAGE_TITLE),
  );

  protected readonly quickOrdersQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const tab = this.activeTab();
    const search = this.searchFilter();
    const status = resolveQuickOrderTabStatus(tab);
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.quickOrders(shopId, page, this.pageSize, tab, search)
        : SHOP_QUERY_KEYS.disabled('quick-orders'),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.quickOrdersService.getQuickOrders({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            ...(status ? { status } : {}),
            ...(search ? { search } : {}),
          }),
        ),
    };
  });

  /** One `limit=1` request per tab — the API has no counts endpoint, `total` is enough. */
  protected readonly countsQuery = injectQuery(() => {
    const shopId = this.shopId();
    const search = this.searchFilter();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.quickOrderCounts(shopId, search)
        : SHOP_QUERY_KEYS.disabled('quick-order-counts'),
      enabled: Boolean(shopId),
      queryFn: async () =>
        buildQuickOrderCounts(
          QUICK_ORDERS_TABS,
          await lastValueFrom(
            forkJoin(
              QUICK_ORDERS_TABS.map(({ value }) => {
                const status = resolveQuickOrderTabStatus(value);
                return this.quickOrdersService.getQuickOrders({
                  page: 1,
                  limit: QUICK_ORDERS_COUNT_LIMIT,
                  shopId: shopId ?? '',
                  ...(status ? { status } : {}),
                  ...(search ? { search } : {}),
                });
              }),
            ),
          ),
        ),
    };
  });

  protected readonly updateStatusMutation = injectMutation(() => ({
    mutationFn: ({ id, status }: UpdateQuickOrderStatusVariables) =>
      lastValueFrom(this.quickOrdersService.updateQuickOrder(id, { status })),
  }));

  protected readonly isLoading = computed(() => this.quickOrdersQuery.isPending());
  protected readonly hasError = computed(() => this.quickOrdersQuery.isError());
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFilterDisabled = computed(
    () => !this.isShopContextReady() || this.quickOrdersQuery.isFetching(),
  );
  protected readonly tabs = computed(() =>
    buildQuickOrderTabViews(QUICK_ORDERS_TABS, this.countsQuery.data()),
  );
  protected readonly orders = computed(() =>
    (this.quickOrdersQuery.data()?.items ?? []).map(mapQuickOrder),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.quickOrdersQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.quickOrdersQuery.data()));
  protected readonly pendingOrderId = computed(() =>
    this.updateStatusMutation.isPending()
      ? (this.updateStatusMutation.variables()?.id ?? null)
      : null,
  );

  protected onTabSelect(tab: QuickOrderTab): void {
    this.activeTab.set(tab);
  }

  protected onApplyFilters(): void {
    const nextSearch = normalizeQuickOrderSearch(this.searchInput());
    if (nextSearch === this.searchFilter()) {
      return;
    }

    this.searchFilter.set(nextSearch);
    this.currentPage.set(1);
  }

  protected onResetFilters(): void {
    this.searchInput.set('');
    if (!this.searchFilter()) {
      return;
    }

    this.searchFilter.set('');
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    if (isPageChangeAllowed(page, this.currentPage(), this.totalPages())) {
      this.currentPage.set(page);
    }
  }

  protected onOpenProduct(productId: string): void {
    const shopId = this.shopId();
    if (shopId) {
      void this.router.navigate([
        APP_ROUTES.ADMIN_SHOP,
        shopId,
        PRODUCTS_SECTION_PATH,
        productId,
        PRODUCTS_UPDATE_PATH,
      ]);
    }
  }

  protected onStatusChange(variables: UpdateQuickOrderStatusVariables): void {
    const shopId = this.shopId();
    if (!shopId || this.updateStatusMutation.isPending()) {
      return;
    }

    const listKey = SHOP_QUERY_KEYS.quickOrders(
      shopId,
      this.currentPage(),
      this.pageSize,
      this.activeTab(),
      this.searchFilter(),
    );
    const tab = this.activeTab();

    this.updateStatusMutation.mutate(variables, {
      onSuccess: () => {
        this.queryClient.setQueryData<QuickOrderListResponse>(listKey, (response) =>
          applyQuickOrderStatusChange(response, variables.id, variables.status, tab),
        );
        this.toasterService.success(QUICK_ORDER_STATUS_SUCCESS_TITLES[variables.status]);
        void this.queryClient.invalidateQueries({
          queryKey: SHOP_QUERY_KEYS.quickOrdersScope(shopId),
        });
      },
    });
  }
}
