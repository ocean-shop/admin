import { Component, computed, inject, linkedSignal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { Dropdown } from '@ui/dropdown/dropdown';
import { isDropdownOptionValue } from '@ui/dropdown/helpers/dropdown-option.helper';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { InfoList } from '@ui/info-list/info-list';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { SectionCard } from '@ui/section-card/section-card';
import { StateMessage } from '@ui/state-message/state-message';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopSectionPageBreadcrumbs } from '../../helpers/shop-breadcrumbs.helper';
import {
  ORDERS_SECTION_PATH,
  ORDER_ITEMS_TABLE_COLUMNS,
  ORDER_PAYMENT_STATUS_ICON,
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_STATUS_ICON,
  ORDER_STATUS_OPTIONS,
  ORDERS_TEXTS,
} from '../orders/constants/orders.constants';
import {
  buildOrderExtraRows,
  buildOrderInfoRows,
  buildOrderItemRows,
  buildOrderUserRows,
  resolveOrderItems,
  resolveOrderPaymentStatus,
  resolveOrderStatus,
} from '../orders/helpers/order-mapping.helper';
import { OrderPaymentStatus } from '../orders/models/order-payment-status.enum';
import { OrderStatus } from '../orders/models/order-status.enum';
import { UpdateOrderPaymentStatusVariables } from '../orders/models/update-order-payment-status-payload.model';
import { UpdateOrderStatusVariables } from '../orders/models/update-order-status-payload.model';
import { OrdersService } from '../orders/services/orders.service';

@Component({
  selector: 'app-orders-detail',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    SectionCard,
    InfoList,
    Table,
    Dropdown,
    Button,
  ],
  templateUrl: './orders-detail.html',
  styleUrl: './orders-detail.scss',
})
export class OrdersDetail {
  private readonly ordersService = inject(OrdersService);
  private readonly queryClient = injectQueryClient();
  private readonly toasterService = inject(ToasterService);

  protected readonly textData = ORDERS_TEXTS;
  protected readonly paymentStatusOptions = ORDER_PAYMENT_STATUS_OPTIONS;
  protected readonly statusOptions = ORDER_STATUS_OPTIONS;
  protected readonly paymentStatusIcon = ORDER_PAYMENT_STATUS_ICON;
  protected readonly statusIcon = ORDER_STATUS_ICON;
  protected readonly itemColumns = ORDER_ITEMS_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly orderId = injectRouteParam('orderId');

  protected readonly breadcrumbItems = computed(() =>
    buildShopSectionPageBreadcrumbs(
      this.shopId(),
      ORDERS_SECTION_PATH,
      ORDERS_TEXTS.PAGE_TITLE,
      ORDERS_TEXTS.DETAILS_TITLE,
    ),
  );

  protected readonly orderQuery = injectQuery(() => {
    const orderId = this.orderId();
    return {
      queryKey: orderId ? SHOP_QUERY_KEYS.orderById(orderId) : SHOP_QUERY_KEYS.disabled('order'),
      enabled: Boolean(this.shopId() && orderId),
      queryFn: () => lastValueFrom(this.ordersService.getOrderById(orderId ?? '')),
    };
  });

  protected readonly updatePaymentStatusMutation = injectMutation(() => ({
    mutationFn: ({ orderId, paymentStatus }: UpdateOrderPaymentStatusVariables) =>
      lastValueFrom(this.ordersService.updateOrderPaymentStatus(orderId, { paymentStatus })),
  }));

  protected readonly updateStatusMutation = injectMutation(() => ({
    mutationFn: ({ orderId, status }: UpdateOrderStatusVariables) =>
      lastValueFrom(this.ordersService.updateOrderStatus(orderId, { status })),
  }));

  protected readonly order = computed(() => this.orderQuery.data() ?? null);
  private readonly savedPaymentStatus = computed(() =>
    resolveOrderPaymentStatus(this.order()?.paymentStatus),
  );
  private readonly savedOrderStatus = computed(() => resolveOrderStatus(this.order()?.status));

  /** Editable copies that reset whenever the server value changes. */
  protected readonly selectedPaymentStatus = linkedSignal(() => this.savedPaymentStatus());
  protected readonly selectedOrderStatus = linkedSignal(() => this.savedOrderStatus());

  protected readonly isLoading = computed(
    () => this.orderQuery.isPending() || this.orderQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.orderQuery.isError());
  protected readonly isPaymentUpdating = computed(() =>
    this.updatePaymentStatusMutation.isPending(),
  );
  protected readonly isStatusUpdating = computed(() => this.updateStatusMutation.isPending());
  protected readonly canSavePaymentStatus = computed(
    () => Boolean(this.order()) && this.savedPaymentStatus() !== this.selectedPaymentStatus(),
  );
  protected readonly canSaveStatus = computed(
    () => Boolean(this.order()) && this.savedOrderStatus() !== this.selectedOrderStatus(),
  );
  protected readonly orderItemRows = computed(() => {
    const order = this.order();
    return order ? buildOrderItemRows(resolveOrderItems(order)) : [];
  });
  protected readonly orderInfoRows = computed(() => {
    const order = this.order();
    return order ? buildOrderInfoRows(order) : [];
  });
  protected readonly userInfoRows = computed(() => {
    const order = this.order();
    return order ? buildOrderUserRows(order) : [];
  });
  protected readonly extraDataRows = computed(() => {
    const order = this.order();
    return order ? buildOrderExtraRows(order) : [];
  });

  protected onPaymentStatusSelected(option: DropdownOption): void {
    if (isDropdownOptionValue<OrderPaymentStatus>(option.value, this.paymentStatusOptions)) {
      this.selectedPaymentStatus.set(option.value);
    }
  }

  protected onStatusSelected(option: DropdownOption): void {
    if (isDropdownOptionValue<OrderStatus>(option.value, this.statusOptions)) {
      this.selectedOrderStatus.set(option.value);
    }
  }

  protected onSavePaymentStatus(): void {
    const orderId = this.orderId();
    if (!orderId || this.isPaymentUpdating() || !this.canSavePaymentStatus()) {
      return;
    }

    this.updatePaymentStatusMutation.mutate(
      { orderId, paymentStatus: this.selectedPaymentStatus() },
      { onSuccess: () => this.onOrderUpdated(orderId, ORDERS_TEXTS.PAYMENT_STATUS_UPDATED_TITLE) },
    );
  }

  protected onSaveStatus(): void {
    const orderId = this.orderId();
    if (!orderId || this.isStatusUpdating() || !this.canSaveStatus()) {
      return;
    }

    this.updateStatusMutation.mutate(
      { orderId, status: this.selectedOrderStatus() },
      { onSuccess: () => this.onOrderUpdated(orderId, ORDERS_TEXTS.ORDER_STATUS_UPDATED_TITLE) },
    );
  }

  private onOrderUpdated(orderId: string, successTitle: string): void {
    this.toasterService.success(successTitle);
    this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.orderById(orderId) });

    const shopId = this.shopId();
    if (shopId) {
      this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.ordersScope(shopId) });
    }
  }
}
