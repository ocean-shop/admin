import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import {
  formatAmount,
  formatDate,
  formatNumber,
  formatNumberOrText,
  formatStatus,
  formatText,
  toTrimmedString,
} from '@core/helpers/value-format/value-format.helper';
import { InfoListRow } from '@ui/info-list/models/info-list-row.model';
import { TableRowData } from '@ui/table/models/table-column.model';
import { SortOrder } from '../../../../models/sort-order.type';
import {
  ORDER_DETAILS_NUMBER_PREFIX,
  ORDER_DETAILS_SEPARATOR,
  ORDER_DISCOUNT_SIGN,
  ORDER_ITEM_DEFAULT_QUANTITY,
  ORDER_NAME_SEPARATOR,
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_PAYMENT_STATUS_BADGE_TONES,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_SHIPPING_METHOD_LABELS,
  ORDER_STATUS_BADGE_TONES,
  ORDER_STATUS_LABELS,
  ORDERS_TEXTS,
} from '../../constants/orders.constants';
import { OrderCustomer } from '../../models/order-customer.model';
import { OrderPaymentMethod } from '../../models/order-payment-method.enum';
import { OrderPaymentStatus } from '../../models/order-payment-status.enum';
import { OrderShippingMethod } from '../../models/order-shipping-method.enum';
import { OrderSortQuery } from '../../models/order-sort-query.model';
import { OrderSortValue } from '../../models/order-sort-value.type';
import { OrderStatus } from '../../models/order-status.enum';
import {
  Order,
  OrderApiItem,
  OrderProductApiItem,
  OrderUserApiItem,
} from '../../models/order.model';

/** Translated payment status; unknown values fall back to a title-cased raw value. */
export const formatOrderPaymentStatusLabel = (value: unknown): string =>
  ORDER_PAYMENT_STATUS_LABELS[value as OrderPaymentStatus] ?? formatStatus(value);

/** Translated order status; unknown values fall back to a title-cased raw value. */
export const formatOrderStatusLabel = (value: unknown): string =>
  ORDER_STATUS_LABELS[value as OrderStatus] ?? formatStatus(value);

export const formatOrderPaymentMethodLabel = (value: unknown): string =>
  ORDER_PAYMENT_METHOD_LABELS[value as OrderPaymentMethod] ?? formatStatus(value);

export const formatOrderShippingMethodLabel = (value: unknown): string =>
  ORDER_SHIPPING_METHOD_LABELS[value as OrderShippingMethod] ?? formatStatus(value);

export const mapOrder = (order: OrderApiItem, fallbackShopId: string): Order => ({
  id: order.id?.trim() || crypto.randomUUID(),
  shopId: order.shopId?.trim() || fallbackShopId,
  orderNumber: formatNumberOrText(order.orderNumber),
  totalAmount: formatAmount(order.totalAmount),
  paymentStatus: formatOrderPaymentStatusLabel(order.paymentStatus),
  status: formatOrderStatusLabel(order.status),
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

/** The account that placed the order (newer API sends `user`, older — `createdBy`). */
export const resolveOrderUser = (order: OrderApiItem): OrderUserApiItem | null =>
  order.user ?? order.createdBy ?? null;

/** Trimmed non-empty values joined by the separator; empty string when none. */
const joinFilled = (values: unknown[], separator: string): string =>
  values.map(toTrimmedString).filter(Boolean).join(separator);

const resolveFirstName = (order: OrderApiItem): string =>
  toTrimmedString(order.firstName) || toTrimmedString(resolveOrderUser(order)?.firstName);

const resolveLastName = (order: OrderApiItem): string =>
  toTrimmedString(order.lastName) || toTrimmedString(resolveOrderUser(order)?.lastName);

const resolveEmail = (order: OrderApiItem): string =>
  toTrimmedString(order.email) || toTrimmedString(resolveOrderUser(order)?.email);

/** `№4`; the placeholder alone when the number is missing. */
export const formatOrderDetailsNumber = (value: unknown): string => {
  const orderNumber = formatNumberOrText(value);
  return orderNumber === EMPTY_VALUE_PLACEHOLDER
    ? orderNumber
    : `${ORDER_DETAILS_NUMBER_PREFIX}${orderNumber}`;
};

export const buildOrderItemRows = (items: OrderProductApiItem[]): TableRowData[] =>
  items.map((item) => ({
    name: formatText(item.product?.name),
    image: toTrimmedString(item.product?.images?.[0]?.url) || null,
    sku: formatText(item.product?.sku),
    quantity: formatNumber(item.quantity),
    price: formatAmount(item.unitPrice),
    total: formatAmount((item.quantity || ORDER_ITEM_DEFAULT_QUANTITY) * Number(item.unitPrice)),
  }));

export const buildOrderInfoRows = (order: OrderApiItem): InfoListRow[] => {
  const paymentStatus = formatOrderPaymentStatusLabel(order.paymentStatus);
  const status = formatOrderStatusLabel(order.status);

  return [
    {
      label: ORDERS_TEXTS.INFO_ORDER_NUMBER_LABEL,
      value: formatOrderDetailsNumber(order.orderNumber),
    },
    { label: ORDERS_TEXTS.INFO_AMOUNT_LABEL, value: formatAmount(order.totalAmount) },
    {
      label: ORDERS_TEXTS.INFO_PAYMENT_STATUS_LABEL,
      value: paymentStatus,
      tone: ORDER_PAYMENT_STATUS_BADGE_TONES[paymentStatus],
    },
    {
      label: ORDERS_TEXTS.INFO_ORDER_STATUS_LABEL,
      value: status,
      tone: ORDER_STATUS_BADGE_TONES[status],
    },
    { label: ORDERS_TEXTS.INFO_CREATED_LABEL, value: formatDate(order.createdAt) },
    { label: ORDERS_TEXTS.INFO_UPDATED_LABEL, value: formatDate(order.updatedAt) },
  ];
};

/** Subtotal, discount (only when present) and the grand total under the items table. */
export const buildOrderSummaryRows = (order: OrderApiItem): InfoListRow[] => {
  const discount = Number(order.discountAmount);
  const discountRows: InfoListRow[] =
    discount > 0
      ? [
          {
            label: ORDERS_TEXTS.SUMMARY_DISCOUNT_LABEL,
            value: `${ORDER_DISCOUNT_SIGN}${formatAmount(order.discountAmount)}`,
          },
        ]
      : [];

  return [
    { label: ORDERS_TEXTS.SUMMARY_SUBTOTAL_LABEL, value: formatAmount(order.subtotalAmount) },
    ...discountRows,
    {
      label: ORDERS_TEXTS.SUMMARY_TOTAL_LABEL,
      value: formatAmount(order.totalAmount),
      emphasis: true,
    },
  ];
};

/** Contact and delivery fields with human-readable labels. */
export const buildOrderCustomerRows = (order: OrderApiItem): InfoListRow[] => {
  const user = resolveOrderUser(order);
  const shippingNumber = toTrimmedString(order.shippingNumber);
  const shippingMethodLabel = order.shippingMethod
    ? formatOrderShippingMethodLabel(order.shippingMethod)
    : '';
  /** The shipping number often already starts with the carrier name — don't repeat it. */
  const shippingMethod = shippingNumber.startsWith(shippingMethodLabel) ? '' : shippingMethodLabel;

  return [
    {
      label: ORDERS_TEXTS.CUSTOMER_NAME_LABEL,
      value: formatText(
        joinFilled([resolveFirstName(order), resolveLastName(order)], ORDER_NAME_SEPARATOR),
      ),
    },
    { label: ORDERS_TEXTS.CUSTOMER_MIDDLE_NAME_LABEL, value: formatText(order.middleName) },
    { label: ORDERS_TEXTS.CUSTOMER_EMAIL_LABEL, value: formatText(resolveEmail(order)) },
    {
      label: ORDERS_TEXTS.CUSTOMER_PHONE_LABEL,
      value: formatText(toTrimmedString(order.phoneNumber) || toTrimmedString(user?.phone)),
      mono: true,
    },
    {
      label: ORDERS_TEXTS.CUSTOMER_SHIPPING_LABEL,
      value: formatText(joinFilled([shippingMethod, shippingNumber], ORDER_DETAILS_SEPARATOR)),
    },
    {
      label: ORDERS_TEXTS.CUSTOMER_PAYMENT_METHOD_LABEL,
      value: order.paymentMethod
        ? formatOrderPaymentMethodLabel(order.paymentMethod)
        : EMPTY_VALUE_PLACEHOLDER,
    },
    {
      label: ORDERS_TEXTS.CUSTOMER_USER_ID_LABEL,
      value: formatText(toTrimmedString(order.userId) || toTrimmedString(user?.id)),
      mono: true,
    },
  ];
};

/** Name, email and avatar initials of the buyer. */
export const buildOrderCustomer = (order: OrderApiItem): OrderCustomer => {
  const firstName = resolveFirstName(order);
  const lastName = resolveLastName(order);
  const email = resolveEmail(order);
  const initials = (
    firstName || lastName ? `${firstName[0] ?? ''}${lastName[0] ?? ''}` : email[0]
  )?.toUpperCase();

  return {
    name: formatText(joinFilled([firstName, lastName], ORDER_NAME_SEPARATOR)),
    email: formatText(email),
    initials: initials || EMPTY_VALUE_PLACEHOLDER,
  };
};

/** `Замовлення №4`. */
export const buildOrderDetailsTitle = (order: OrderApiItem): string =>
  `${ORDERS_TEXTS.DETAILS_ORDER_TITLE} ${formatOrderDetailsNumber(order.orderNumber)}`;

/** `Створено 20.10.2026, 10:11 · olena@example.com` (email omitted when missing). */
export const buildOrderDetailsDescription = (order: OrderApiItem): string =>
  joinFilled(
    [`${ORDERS_TEXTS.DETAILS_CREATED_PREFIX} ${formatDate(order.createdAt)}`, resolveEmail(order)],
    ORDER_DETAILS_SEPARATOR,
  );
