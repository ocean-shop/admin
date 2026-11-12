import { Component, computed, inject, linkedSignal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Badge } from '@ui/badge/badge';
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
import { buildShopSectionPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import {
  ORDERS_SECTION_PATH,
  ORDER_ITEMS_TABLE_COLUMNS,
  ORDER_PAYMENT_STATUS_ICON,
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_STATUS_BADGE_TONES,
  ORDER_STATUS_ICON,
  ORDER_STATUS_OPTIONS,
  ORDERS_TEXTS,
} from '../orders/constants/orders.constants';
import {
  buildOrderCustomer,
  buildOrderCustomerRows,
  buildOrderDetailsDescription,
  buildOrderDetailsTitle,
  buildOrderInfoRows,
  buildOrderItemRows,
  buildOrderSummaryRows,
  formatOrderDetailsNumber,
  formatOrderStatusLabel,
  resolveOrderItems,
  resolveOrderPaymentStatus,
  resolveOrderStatus,
} from '../orders/helpers/order-mapping/order-mapping.helper';
import { OrderPaymentStatus } from '../orders/models/order-payment-status.enum';
import { OrderStatus } from '../orders/models/order-status.enum';
import { UpdateOrderStatusesVariables } from '../orders/models/update-order-statuses-variables.model';
import { OrdersService } from '../orders/services/orders/orders.service';

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
    Badge,
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

  protected readonly orderQuery = injectQuery(() => {
    const orderId = this.orderId();
    return {
      queryKey: orderId ? SHOP_QUERY_KEYS.orderById(orderId) : SHOP_QUERY_KEYS.disabled('order'),
      enabled: Boolean(this.shopId() && orderId),
      queryFn: () => lastValueFrom(this.ordersService.getOrderById(orderId ?? '')),
    };
  });

  protected readonly updateStatusesMutation = injectMutation(() => ({
    mutationFn: async ({
      orderId,
      paymentStatus,
      status,
    }: UpdateOrderStatusesVariables): Promise<void> => {
      if (paymentStatus) {
        await lastValueFrom(
          this.ordersService.updateOrderPaymentStatus(orderId, { paymentStatus }),
        );
      }

      if (status) {
        await lastValueFrom(this.ordersService.updateOrderStatus(orderId, { status }));
      }
    },
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
  protected readonly isStatusesUpdating = computed(() => this.updateStatusesMutation.isPending());
  private readonly isPaymentStatusChanged = computed(
    () => this.savedPaymentStatus() !== this.selectedPaymentStatus(),
  );
  private readonly isOrderStatusChanged = computed(
    () => this.savedOrderStatus() !== this.selectedOrderStatus(),
  );
  protected readonly canSaveStatuses = computed(
    () => Boolean(this.order()) && (this.isPaymentStatusChanged() || this.isOrderStatusChanged()),
  );

  protected readonly pageTitle = computed(() => {
    const order = this.order();
    return order ? buildOrderDetailsTitle(order) : ORDERS_TEXTS.DETAILS_TITLE;
  });
  protected readonly pageDescription = computed(() => {
    const order = this.order();
    return order ? buildOrderDetailsDescription(order) : ORDERS_TEXTS.DETAILS_DESCRIPTION;
  });
  protected readonly statusLabel = computed(() => formatOrderStatusLabel(this.order()?.status));
  protected readonly statusTone = computed(
    () => ORDER_STATUS_BADGE_TONES[this.statusLabel()] ?? 'neutral',
  );
  protected readonly breadcrumbItems = computed(() => {
    const order = this.order();
    return buildShopSectionPageBreadcrumbs(
      this.shopId(),
      ORDERS_SECTION_PATH,
      ORDERS_TEXTS.PAGE_TITLE,
      order ? formatOrderDetailsNumber(order.orderNumber) : ORDERS_TEXTS.DETAILS_TITLE,
    );
  });

  protected readonly orderItemRows = computed(() => {
    const order = this.order();
    return order ? buildOrderItemRows(resolveOrderItems(order)) : [];
  });
  protected readonly itemsCount = computed(() => String(this.orderItemRows().length));
  protected readonly orderInfoRows = computed(() => {
    const order = this.order();
    return order ? buildOrderInfoRows(order) : [];
  });
  protected readonly summaryRows = computed(() => {
    const order = this.order();
    return order ? buildOrderSummaryRows(order) : [];
  });
  protected readonly customerRows = computed(() => {
    const order = this.order();
    return order ? buildOrderCustomerRows(order) : [];
  });
  protected readonly customer = computed(() => {
    const order = this.order();
    return order ? buildOrderCustomer(order) : null;
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

  protected onSaveStatuses(): void {
    const orderId = this.orderId();
    if (!orderId || this.isStatusesUpdating() || !this.canSaveStatuses()) {
      return;
    }

    this.updateStatusesMutation.mutate(
      {
        orderId,
        paymentStatus: this.isPaymentStatusChanged() ? this.selectedPaymentStatus() : undefined,
        status: this.isOrderStatusChanged() ? this.selectedOrderStatus() : undefined,
      },
      { onSuccess: () => this.onOrderUpdated(orderId) },
    );
  }

  private onOrderUpdated(orderId: string): void {
    this.toasterService.success(ORDERS_TEXTS.STATUSES_UPDATED_TITLE);
    this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.orderById(orderId) });

    const shopId = this.shopId();
    if (shopId) {
      this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.ordersScope(shopId) });
    }
  }
}
