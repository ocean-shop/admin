import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import {
  isPageChangeAllowed,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination/pagination.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { ConfirmModal } from '@ui/confirm-modal/confirm-modal';
import { isDropdownOptionValue } from '@ui/dropdown/helpers/dropdown-option.helper';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { FilterActions } from '@ui/filter-actions/filter-actions';
import { FilterBar } from '@ui/filter-bar/filter-bar';
import { FilterDropdown } from '@ui/filter-dropdown/filter-dropdown';
import { FilterInput } from '@ui/filter-input/filter-input';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { resolveTableRowId } from '@ui/table/helpers/table-row.helper';
import { TableRowData } from '@ui/table/models/table-column.model';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import {
  ORDER_NUMBER_PREFIX,
  ORDERS_NUMBER_FILTER_ID,
  ORDERS_PAGE_SIZE,
  ORDERS_SECTION_PATH,
  ORDERS_SORT_ICON,
  ORDERS_SORT_OPTIONS,
  ORDERS_TABLE_COLUMNS,
  ORDERS_TEXTS,
} from './constants/orders.constants';
import { mapOrder, resolveOrderSortQuery } from './helpers/order-mapping/order-mapping.helper';
import { Order } from './models/order.model';
import { OrderSortValue } from './models/order-sort-value.type';
import { OrdersService } from './services/orders/orders.service';

@Component({
  selector: 'app-orders',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    FilterBar,
    FilterInput,
    FilterDropdown,
    FilterActions,
    Table,
    Pagination,
    ConfirmModal,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = ORDERS_TEXTS;
  protected readonly pageSize = ORDERS_PAGE_SIZE;
  protected readonly sortOptions = ORDERS_SORT_OPTIONS;
  protected readonly sortIcon = ORDERS_SORT_ICON;
  protected readonly orderNumberFilterId = ORDERS_NUMBER_FILTER_ID;
  protected readonly tableColumns = ORDERS_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly currentPage = linkedSignal({ source: this.shopId, computation: () => 1 });
  protected readonly selectedOrder = signal<Order | null>(null);
  protected readonly selectedSort = signal<OrderSortValue>('newest');
  protected readonly orderNumberInput = signal('');
  protected readonly orderNumberFilter = signal('');

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), ORDERS_TEXTS.PAGE_TITLE),
  );

  protected readonly ordersQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const sort = this.selectedSort();
    const orderNumber = this.orderNumberFilter();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.orders(shopId, page, this.pageSize, sort, orderNumber)
        : SHOP_QUERY_KEYS.disabled('orders'),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.ordersService.getOrders({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            ...resolveOrderSortQuery(sort),
            ...(orderNumber ? { orderNumber } : {}),
          }),
        ),
    };
  });

  protected readonly deleteOrderMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.ordersService.deleteOrder(id)),
  }));

  protected readonly isLoading = computed(
    () => this.ordersQuery.isPending() || this.ordersQuery.isFetching(),
  );
  protected readonly hasError = computed(
    () => this.ordersQuery.isError() || this.deleteOrderMutation.isError(),
  );
  protected readonly isActionLoading = computed(() => this.deleteOrderMutation.isPending());
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFilterDisabled = computed(
    () => !this.isShopContextReady() || this.isLoading(),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.ordersQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.ordersQuery.data()));
  protected readonly orders = computed<Order[]>(() => {
    const shopId = this.shopId();
    return shopId
      ? (this.ordersQuery.data()?.items ?? []).map((item) => mapOrder(item, shopId))
      : [];
  });
  protected readonly orderRows = computed<TableRowData[]>(() =>
    this.orders().map(({ id, orderNumber, totalAmount, paymentStatus, status, createdAt }) => ({
      id,
      orderNumber,
      totalAmount,
      paymentStatus,
      status,
      createdAt,
    })),
  );
  protected readonly isDeleteModalOpen = computed(() => Boolean(this.selectedOrder()));
  protected readonly selectedOrderLabel = computed(() => {
    const order = this.selectedOrder();
    return order ? `${ORDER_NUMBER_PREFIX}${order.orderNumber}` : '';
  });

  protected onShowOrder(row: TableRowData): void {
    const shopId = this.shopId();
    const orderId = resolveTableRowId(row);
    if (shopId && orderId) {
      this.router.navigate([APP_ROUTES.ADMIN_SHOP, shopId, ORDERS_SECTION_PATH, orderId]);
    }
  }

  protected onDeleteOrder(row: TableRowData): void {
    const orderId = resolveTableRowId(row);
    const order = this.orders().find((entry) => entry.id === orderId);
    if (order) {
      this.selectedOrder.set(order);
    }
  }

  protected onSortSelected(option: DropdownOption): void {
    if (
      !isDropdownOptionValue<OrderSortValue>(option.value, this.sortOptions) ||
      option.value === this.selectedSort()
    ) {
      return;
    }

    this.selectedSort.set(option.value);
    this.currentPage.set(1);
  }

  protected onApplyFilters(): void {
    const nextOrderNumberFilter = this.orderNumberInput().trim();
    if (nextOrderNumberFilter === this.orderNumberFilter()) {
      return;
    }

    this.orderNumberFilter.set(nextOrderNumberFilter);
    this.currentPage.set(1);
  }

  protected onResetFilters(): void {
    this.orderNumberInput.set('');
    if (!this.orderNumberFilter()) {
      return;
    }

    this.orderNumberFilter.set('');
    this.currentPage.set(1);
  }

  protected onCloseDeleteModal(): void {
    if (!this.isActionLoading()) {
      this.selectedOrder.set(null);
    }
  }

  protected onConfirmDelete(): void {
    const selectedOrder = this.selectedOrder();
    if (!selectedOrder || this.isActionLoading()) {
      return;
    }

    this.deleteOrderMutation.mutate(selectedOrder.id, {
      onSuccess: () => {
        this.selectedOrder.set(null);
        const shopId = this.shopId();
        if (shopId) {
          this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.ordersScope(shopId) });
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
