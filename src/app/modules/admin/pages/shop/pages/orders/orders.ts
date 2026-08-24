import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Modal } from '@ui/modal/modal';
import { Pagination } from '@ui/pagination/pagination';
import { Table } from '@ui/table/table';
import { TableColumn, TableRowData } from '@ui/table/models/table-column.model';
import { buildShopBreadcrumb } from '../../constants/shop-breadcrumbs.constants';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import {
  ORDERS_NUMBER_FILTER_ID,
  ORDERS_PAGE_SIZE,
  ORDERS_SORT_OPTIONS,
  ORDERS_TEXTS,
} from './constants/orders.constants';
import { Order, OrderApiItem, OrderListQueryParams } from './models/order.model';
import { OrderSortValue } from './models/order-sort-value.type';
import { OrdersService } from './services/orders.service';

@Component({
  selector: 'app-orders',
  imports: [Dropdown, Table, Pagination, Modal, Breadcrumbs],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = ORDERS_TEXTS;
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
    { label: this.textData.PAGE_TITLE },
  ]);
  protected readonly pageSize = ORDERS_PAGE_SIZE;
  protected readonly sortOptions = ORDERS_SORT_OPTIONS;
  protected readonly orderNumberFilterId = ORDERS_NUMBER_FILTER_ID;
  protected readonly tableColumns: TableColumn[] = [
    { key: 'orderNumber', header: ORDERS_TEXTS.TABLE_NUMBER_HEADER },
    { key: 'totalAmount', header: ORDERS_TEXTS.TABLE_TOTAL_HEADER, align: 'right' },
    { key: 'paymentStatus', header: ORDERS_TEXTS.TABLE_PAYMENT_STATUS_HEADER },
    { key: 'status', header: ORDERS_TEXTS.TABLE_STATUS_HEADER },
    { key: 'createdAt', header: ORDERS_TEXTS.TABLE_CREATED_AT_HEADER },
  ];

  protected readonly shopId = signal<string | null>(
    this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null,
  );
  protected readonly currentPage = signal(1);
  protected readonly selectedOrder = signal<Order | null>(null);
  protected readonly selectedSort = signal<OrderSortValue>('newest');
  protected readonly orderNumberInput = signal('');
  protected readonly orderNumberFilter = signal('');

  protected readonly ordersQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const sort = this.selectedSort();
    const query: OrderListQueryParams = {
      page,
      limit: this.pageSize,
      shopId: shopId ?? '',
      ...this.resolveSortQuery(sort),
      ...(this.orderNumberFilter() ? { orderNumber: this.orderNumberFilter() } : {}),
    };

    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.orders(shopId, query.page, query.limit, sort, this.orderNumberFilter())
        : ['shop', 'orders', 'missing-shop-id'],
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.ordersService.getOrders(query)),
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
  protected readonly totalItems = computed(() => Math.max(0, this.ordersQuery.data()?.total ?? 0));
  protected readonly totalPages = computed(() =>
    Math.max(1, this.ordersQuery.data()?.totalPages ?? 1),
  );
  protected readonly orders = computed<Order[]>(() => {
    const shopId = this.shopId();
    if (!shopId) {
      return [];
    }

    return (this.ordersQuery.data()?.items ?? []).map((item) => this.mapOrder(item, shopId));
  });
  protected readonly orderRows = computed<TableRowData[]>(() =>
    this.orders().map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
    })),
  );
  protected readonly isDeleteModalOpen = computed(() => Boolean(this.selectedOrder()));

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onShowOrder(row: TableRowData): void {
    const shopId = this.shopId();
    const orderId = this.resolveOrderId(row);
    if (!shopId || !orderId) {
      return;
    }

    this.router.navigate(['/admin/shop', shopId, 'orders', orderId]);
  }

  protected onDeleteOrder(row: TableRowData): void {
    const orderId = this.resolveOrderId(row);
    if (!orderId) {
      return;
    }

    const order = this.orders().find((entry) => entry.id === orderId);
    if (!order) {
      return;
    }

    this.selectedOrder.set(order);
  }

  protected onOrderNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.orderNumberInput.set(target?.value ?? '');
  }

  protected onSortSelected(option: DropdownOption): void {
    if (!this.isValidSortValue(option.value) || option.value === this.selectedSort()) {
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
    if (this.deleteOrderMutation.isPending()) {
      return;
    }

    this.selectedOrder.set(null);
  }

  protected onConfirmDelete(): void {
    const selectedOrder = this.selectedOrder();
    if (!selectedOrder || this.deleteOrderMutation.isPending()) {
      return;
    }

    this.deleteOrderMutation.mutate(selectedOrder.id, {
      onSuccess: () => {
        const shopId = this.shopId();
        this.selectedOrder.set(null);
        if (!shopId) {
          return;
        }

        this.queryClient.invalidateQueries({
          queryKey: ['shop', shopId, 'orders'],
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

  private mapOrder(order: OrderApiItem, fallbackShopId: string): Order {
    return {
      id: order.id?.trim() || crypto.randomUUID(),
      shopId: order.shopId?.trim() || fallbackShopId,
      orderNumber: this.resolveOrderNumber(order.orderNumber),
      totalAmount: this.resolveAmountLabel(order.totalAmount),
      paymentStatus: this.resolveStatusLabel(order.paymentStatus),
      status: this.resolveStatusLabel(order.status),
      createdAt: this.resolveDateLabel(order.createdAt),
    };
  }

  private resolveSortQuery(
    sort: OrderSortValue,
  ): Pick<OrderListQueryParams, 'sortBy' | 'sortOrder'> {
    if (sort === 'older') {
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    }

    return { sortBy: 'createdAt', sortOrder: 'desc' };
  }

  private resolveOrderNumber(orderNumber: OrderApiItem['orderNumber']): string {
    if (typeof orderNumber === 'number' && Number.isFinite(orderNumber)) {
      return String(orderNumber);
    }

    if (typeof orderNumber === 'string') {
      const normalized = orderNumber.trim();
      return normalized || '—';
    }

    return '—';
  }

  private resolveAmountLabel(value: number | string | null | undefined): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toFixed(2);
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized || '—';
    }

    return '—';
  }

  private resolveDateLabel(value: string | null | undefined): string {
    if (!value?.trim()) {
      return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value.trim();
    }

    return parsed.toLocaleString();
  }

  private resolveStatusLabel(value: string | null | undefined): string {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();
    if (!normalized) {
      return '—';
    }

    return normalized
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ');
  }

  private resolveOrderId(row: TableRowData): string | null {
    const rowId = row['id'];
    if (typeof rowId === 'string') {
      const normalized = rowId.trim();
      return normalized || null;
    }

    if (typeof rowId === 'number') {
      return String(rowId);
    }

    return null;
  }

  private isValidSortValue(value: string): value is OrderSortValue {
    return value === 'newest' || value === 'older';
  }
}
