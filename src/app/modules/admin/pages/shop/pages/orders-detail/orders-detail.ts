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
import { Button } from '@ui/button/button';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Table } from '@ui/table/table';
import { TableRowData } from '@ui/table/models/table-column.model';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import {
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_STATUS_OPTIONS,
  ORDERS_TEXTS,
} from '../orders/constants/orders.constants';
import { OrderPaymentStatus } from '../orders/models/order-payment-status.enum';
import { OrderApiItem, OrderProductApiItem, OrderUserApiItem } from '../orders/models/order.model';
import { OrderStatus } from '../orders/models/order-status.enum';
import { OrdersService } from '../orders/services/orders.service';
import { ITEM_COLUMNS } from '../../constants/order.constants';
import { OrderDetailInfoRow } from '../../models/order.models';

@Component({
  selector: 'app-orders-detail',
  imports: [Button, Dropdown, Table],
  templateUrl: './orders-detail.html',
  styleUrl: './orders-detail.scss',
})
export class OrdersDetail implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = injectQueryClient();
  private readonly toasterService = inject(ToasterService);

  protected readonly textData = ORDERS_TEXTS;
  protected readonly paymentStatusOptions = ORDER_PAYMENT_STATUS_OPTIONS;
  protected readonly statusOptions = ORDER_STATUS_OPTIONS;
  protected readonly itemColumns = ITEM_COLUMNS;

  protected readonly shopId = signal<string | null>(
    this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null,
  );
  protected readonly orderId = signal<string | null>(
    this.activatedRoute.snapshot?.paramMap?.get('orderId') ?? null,
  );
  protected readonly selectedPaymentStatus = signal<OrderPaymentStatus>(OrderPaymentStatus.Unpaid);
  protected readonly selectedOrderStatus = signal<OrderStatus>(OrderStatus.Pending);

  protected readonly orderQuery = injectQuery(() => {
    const orderId = this.orderId();
    return {
      queryKey: orderId
        ? SHOP_QUERY_KEYS.orderById(orderId)
        : ['shop', 'orders', 'missing-order-id'],
      enabled: Boolean(this.shopId() && orderId),
      queryFn: () => lastValueFrom(this.ordersService.getOrderById(orderId ?? '')),
    };
  });

  protected readonly updatePaymentStatusMutation = injectMutation(() => ({
    mutationFn: ({
      orderId,
      paymentStatus,
    }: {
      orderId: string;
      paymentStatus: OrderPaymentStatus;
    }) =>
      lastValueFrom(
        this.ordersService.updateOrderPaymentStatus(orderId, {
          paymentStatus,
        }),
      ),
  }));

  protected readonly updateStatusMutation = injectMutation(() => ({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      lastValueFrom(
        this.ordersService.updateOrderStatus(orderId, {
          status,
        }),
      ),
  }));

  protected readonly isLoading = computed(
    () => this.orderQuery.isPending() || this.orderQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.orderQuery.isError());
  protected readonly order = computed(() => this.orderQuery.data() ?? null);
  protected readonly paymentStatusValue = computed(() => this.selectedPaymentStatus());
  protected readonly statusValue = computed(() => this.selectedOrderStatus());
  protected readonly isPaymentUpdating = computed(() =>
    this.updatePaymentStatusMutation.isPending(),
  );
  protected readonly isStatusUpdating = computed(() => this.updateStatusMutation.isPending());
  protected readonly canSavePaymentStatus = computed(() => {
    const order = this.order();
    if (!order) {
      return false;
    }

    return this.resolvePaymentStatus(order.paymentStatus) !== this.selectedPaymentStatus();
  });
  protected readonly canSaveStatus = computed(() => {
    const order = this.order();
    if (!order) {
      return false;
    }

    return this.resolveOrderStatus(order.status) !== this.selectedOrderStatus();
  });
  protected readonly orderItems = computed<OrderProductApiItem[]>(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    return this.resolveOrderItems(order);
  });
  protected readonly orderItemRows = computed<TableRowData[]>(() =>
    this.orderItems().map((item) => ({
      name: item.product?.name?.trim() || '—',
      sku: item.product?.sku?.trim() || '—',
      quantity: this.resolveNumberLabel(item.quantity),
      price: this.resolveAmountLabel(item.unitPrice),
      total: this.resolveAmountLabel((item.quantity || 1) * Number(item.unitPrice)),
    })),
  );
  protected readonly orderInfoRows = computed<OrderDetailInfoRow[]>(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    return [
      { label: 'Номер Замовлення', value: this.resolveOrderNumber(order.orderNumber) },
      { label: 'Сума', value: this.resolveAmountLabel(order.totalAmount) },
      { label: 'Статус оплати', value: this.resolveStatusLabel(order.paymentStatus) },
      { label: 'Статус Замовлення', value: this.resolveStatusLabel(order.status) },
      { label: 'Створено', value: this.resolveDateLabel(order.createdAt) },
      { label: 'Оновлено', value: this.resolveDateLabel(order.updatedAt) },
    ];
  });
  protected readonly userInfoRows = computed<OrderDetailInfoRow[]>(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    const user = this.resolveOrderUser(order);
    return [
      { label: 'Email', value: user?.email?.trim() || '—' },
      { label: "Ім'я", value: user?.firstName?.trim() || '—' },
      { label: 'Прізвище', value: user?.lastName?.trim() || '—' },
      { label: 'Телефон', value: user?.phone?.trim() || '—' },
    ];
  });
  protected readonly extraDataRows = computed<OrderDetailInfoRow[]>(() => {
    const order = this.order();
    if (!order) {
      return [];
    }

    return Object.entries(order)
      .filter(([key]) => !this.isKnownOrderField(key))
      .map(([key, value]) => ({
        label: key,
        value: this.stringifyValue(value),
      }));
  });

  constructor() {
    effect(() => {
      const order = this.order();
      if (!order) {
        return;
      }

      this.selectedPaymentStatus.set(this.resolvePaymentStatus(order.paymentStatus));
      this.selectedOrderStatus.set(this.resolveOrderStatus(order.status));
    });
  }

  ngOnInit(): void {
    this.watchRouteContext();
  }

  protected onPaymentStatusSelected(option: DropdownOption): void {
    if (!this.isOrderPaymentStatus(option.value)) {
      return;
    }

    this.selectedPaymentStatus.set(option.value);
  }

  protected onStatusSelected(option: DropdownOption): void {
    if (!this.isOrderStatus(option.value)) {
      return;
    }

    this.selectedOrderStatus.set(option.value);
  }

  protected onSavePaymentStatus(): void {
    const orderId = this.orderId();
    const paymentStatus = this.selectedPaymentStatus();
    if (!orderId || this.isPaymentUpdating() || !this.canSavePaymentStatus()) {
      return;
    }

    this.updatePaymentStatusMutation.mutate(
      { orderId, paymentStatus },
      {
        onSuccess: () => {
          this.toasterService.success(ORDERS_TEXTS.PAYMENT_STATUS_UPDATED_TITLE);
          this.invalidateOrderQueries(orderId);
        },
        onError: () => {
          this.toasterService.danger(
            ORDERS_TEXTS.UPDATE_PAYMENT_STATUS_ERROR_TITLE,
            ORDERS_TEXTS.UPDATE_PAYMENT_STATUS_ERROR_MESSAGE,
          );
        },
      },
    );
  }

  protected onSaveStatus(): void {
    const orderId = this.orderId();
    const status = this.selectedOrderStatus();
    if (!orderId || this.isStatusUpdating() || !this.canSaveStatus()) {
      return;
    }

    this.updateStatusMutation.mutate(
      { orderId, status },
      {
        onSuccess: () => {
          this.toasterService.success(ORDERS_TEXTS.ORDER_STATUS_UPDATED_TITLE);
          this.invalidateOrderQueries(orderId);
        },
        onError: () => {
          this.toasterService.danger(
            ORDERS_TEXTS.UPDATE_STATUS_ERROR_TITLE,
            ORDERS_TEXTS.UPDATE_STATUS_ERROR_MESSAGE,
          );
        },
      },
    );
  }

  private watchRouteContext(): void {
    this.shopId.set(this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null);
    this.orderId.set(this.activatedRoute.snapshot?.paramMap?.get('orderId') ?? null);

    this.activatedRoute.paramMap
      .pipe(
        map((params) => ({
          shopId: params.get('shopId'),
          orderId: params.get('orderId'),
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ shopId, orderId }) => {
        this.shopId.set(shopId);
        this.orderId.set(orderId);
      });
  }

  private invalidateOrderQueries(orderId: string): void {
    this.queryClient.invalidateQueries({
      queryKey: SHOP_QUERY_KEYS.orderById(orderId),
    });

    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: ['shop', shopId, 'orders'],
    });
  }

  private resolveOrderItems(order: OrderApiItem): OrderProductApiItem[] {
    if (Array.isArray(order.items)) {
      return order.items;
    }

    if (Array.isArray(order.products)) {
      return order.products;
    }

    return [];
  }

  private resolveOrderUser(order: OrderApiItem): OrderUserApiItem | null {
    return order.user ?? order.createdBy ?? null;
  }

  private isKnownOrderField(key: string): boolean {
    return [
      'id',
      'shopId',
      'orderNumber',
      'totalAmount',
      'paymentStatus',
      'status',
      'createdAt',
      'updatedAt',
      'items',
      'products',
      'user',
      'createdBy',
    ].includes(key);
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '—';
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized || '—';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '—';
    }
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

  private resolveNumberLabel(value: number | null | undefined): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
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

  private resolvePaymentStatus(value: string | null | undefined): OrderPaymentStatus {
    return value === OrderPaymentStatus.Paid ? OrderPaymentStatus.Paid : OrderPaymentStatus.Unpaid;
  }

  private resolveOrderStatus(value: string | null | undefined): OrderStatus {
    if (value === OrderStatus.Processing) {
      return OrderStatus.Processing;
    }

    if (value === OrderStatus.Shipped) {
      return OrderStatus.Shipped;
    }

    if (value === OrderStatus.Cancelled) {
      return OrderStatus.Cancelled;
    }

    return OrderStatus.Pending;
  }

  private isOrderPaymentStatus(value: string): value is OrderPaymentStatus {
    return value === OrderPaymentStatus.Paid || value === OrderPaymentStatus.Unpaid;
  }

  private isOrderStatus(value: string): value is OrderStatus {
    return (
      value === OrderStatus.Pending ||
      value === OrderStatus.Processing ||
      value === OrderStatus.Shipped ||
      value === OrderStatus.Cancelled
    );
  }
}
