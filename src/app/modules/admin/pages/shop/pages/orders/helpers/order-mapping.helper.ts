import {
  formatAmount,
  formatDate,
  formatNumber,
  formatNumberOrText,
  formatStatus,
  formatText,
  stringifyValue,
} from '@core/helpers/value-format/value-format.helper';
import { InfoListRow } from '@ui/info-list/models/info-list-row.model';
import { TableRowData } from '@ui/table/models/table-column.model';
import { SortOrder } from '../../../models/sort-order.type';
import {
  ORDER_ITEM_DEFAULT_QUANTITY,
  ORDER_KNOWN_FIELDS,
  ORDERS_TEXTS,
} from '../constants/orders.constants';
import { OrderPaymentStatus } from '../models/order-payment-status.enum';
import { OrderSortQuery } from '../models/order-sort-query.model';
import { OrderSortValue } from '../models/order-sort-value.type';
import { OrderStatus } from '../models/order-status.enum';
import { Order, OrderApiItem, OrderProductApiItem } from '../models/order.model';

export const mapOrder = (order: OrderApiItem, fallbackShopId: string): Order => ({
  id: order.id?.trim() || crypto.randomUUID(),
  shopId: order.shopId?.trim() || fallbackShopId,
  orderNumber: formatNumberOrText(order.orderNumber),
  totalAmount: formatAmount(order.totalAmount),
  paymentStatus: formatStatus(order.paymentStatus),
  status: formatStatus(order.status),
  createdAt: formatDate(order.createdAt),
});

export const resolveOrderSortQuery = (sort: OrderSortValue): OrderSortQuery => {
  const sortOrder: SortOrder = sort === 'older' ? 'asc' : 'desc';
  return { sortBy: 'createdAt', sortOrder };
};

export const resolveOrderPaymentStatus = (value: string | null | undefined): OrderPaymentStatus =>
  value === OrderPaymentStatus.Paid ? OrderPaymentStatus.Paid : OrderPaymentStatus.Unpaid;

export const resolveOrderStatus = (value: string | null | undefined): OrderStatus =>
  Object.values(OrderStatus).find((status) => status === value) ?? OrderStatus.Pending;

export const resolveOrderItems = (order: OrderApiItem): OrderProductApiItem[] => {
  if (Array.isArray(order.items)) {
    return order.items;
  }

  return Array.isArray(order.products) ? order.products : [];
};

export const buildOrderItemRows = (items: OrderProductApiItem[]): TableRowData[] =>
  items.map((item) => ({
    name: formatText(item.product?.name),
    sku: formatText(item.product?.sku),
    quantity: formatNumber(item.quantity),
    price: formatAmount(item.unitPrice),
    total: formatAmount((item.quantity || ORDER_ITEM_DEFAULT_QUANTITY) * Number(item.unitPrice)),
  }));

export const buildOrderInfoRows = (order: OrderApiItem): InfoListRow[] => [
  { label: ORDERS_TEXTS.INFO_ORDER_NUMBER_LABEL, value: formatNumberOrText(order.orderNumber) },
  { label: ORDERS_TEXTS.INFO_AMOUNT_LABEL, value: formatAmount(order.totalAmount) },
  { label: ORDERS_TEXTS.INFO_PAYMENT_STATUS_LABEL, value: formatStatus(order.paymentStatus) },
  { label: ORDERS_TEXTS.INFO_ORDER_STATUS_LABEL, value: formatStatus(order.status) },
  { label: ORDERS_TEXTS.INFO_CREATED_LABEL, value: formatDate(order.createdAt) },
  { label: ORDERS_TEXTS.INFO_UPDATED_LABEL, value: formatDate(order.updatedAt) },
];

export const buildOrderUserRows = (order: OrderApiItem): InfoListRow[] => {
  const user = order.user ?? order.createdBy ?? null;
  return [
    { label: ORDERS_TEXTS.USER_EMAIL_LABEL, value: formatText(user?.email) },
    { label: ORDERS_TEXTS.USER_FIRST_NAME_LABEL, value: formatText(user?.firstName) },
    { label: ORDERS_TEXTS.USER_LAST_NAME_LABEL, value: formatText(user?.lastName) },
    { label: ORDERS_TEXTS.USER_PHONE_LABEL, value: formatText(user?.phone) },
  ];
};

/** Fields the backend sent that have no dedicated section, shown raw. */
export const buildOrderExtraRows = (order: OrderApiItem): InfoListRow[] =>
  Object.entries(order)
    .filter(([key]) => !ORDER_KNOWN_FIELDS.includes(key))
    .map(([key, value]) => ({ label: key, value: stringifyValue(value) }));
