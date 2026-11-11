import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { TableColumn } from '@ui/table/models/table-column.model';
import { OrderPaymentMethod } from '../models/order-payment-method.enum';
import { OrderPaymentStatus } from '../models/order-payment-status.enum';
import { OrderShippingMethod } from '../models/order-shipping-method.enum';
import { OrderStatus } from '../models/order-status.enum';

export const ORDERS_TEXTS = {
  ORDER_ITEMS_EMPTY_STATE: 'Товари замовлення відсутні.',
  INFO_ORDER_NUMBER_LABEL: 'Номер замовлення',
  INFO_AMOUNT_LABEL: 'Сума',
  INFO_PAYMENT_STATUS_LABEL: 'Статус оплати',
  INFO_ORDER_STATUS_LABEL: 'Статус замовлення',
  INFO_CREATED_LABEL: 'Створено',
  INFO_UPDATED_LABEL: 'Оновлено',
  CUSTOMER_NAME_LABEL: "Ім'я",
  CUSTOMER_MIDDLE_NAME_LABEL: 'По батькові',
  CUSTOMER_EMAIL_LABEL: 'Email',
  CUSTOMER_PHONE_LABEL: 'Телефон',
  CUSTOMER_SHIPPING_LABEL: 'Доставка',
  CUSTOMER_PAYMENT_METHOD_LABEL: 'Оплата',
  CUSTOMER_USER_ID_LABEL: 'ID користувача',
  PAGE_TITLE: 'Замовлення',
  PAGE_DESCRIPTION: 'Переглядайте замовлення магазину, відкривайте деталі та керуйте статусами.',
  ORDER_NUMBER_FILTER_LABEL: 'Номер замовлення',
  ORDER_NUMBER_FILTER_PLACEHOLDER: 'Введіть номер замовлення',
  FILTER_APPLY_LABEL: 'Застосувати',
  FILTER_RESET_LABEL: 'Скинути',
  SORT_LABEL: 'Сортування',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/orders), щоб керувати замовленнями.',
  EMPTY_STATE: 'Замовлення не знайдено.',
  TABLE_LOADING_TEXT: 'Завантаження замовлень...',
  TABLE_NUMBER_HEADER: 'Номер',
  TABLE_TOTAL_HEADER: 'Сума',
  TABLE_PAYMENT_STATUS_HEADER: 'Статус оплати',
  TABLE_STATUS_HEADER: 'Статус',
  TABLE_CREATED_AT_HEADER: 'Створено',
  TABLE_ACTIONS_LABEL: 'Дії',
  TABLE_SHOW_LABEL: 'Переглянути замовлення',
  TABLE_DELETE_LABEL: 'Видалити замовлення',
  ITEMS_PRODUCT_HEADER: 'Товар',
  ITEMS_SKU_HEADER: 'SKU',
  ITEMS_QUANTITY_HEADER: 'К-сть',
  ITEMS_PRICE_HEADER: 'Ціна',
  ITEMS_TOTAL_HEADER: 'Сума',
  MODAL_DELETE_TITLE: 'Видалити замовлення',
  MODAL_DELETE_MESSAGE: 'Ви справді хочете видалити замовлення ',
  MODAL_DELETE_MESSAGE_SUFFIX: '? Цю дію не можна скасувати.',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  PAGINATION_LABEL: 'замовлень',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити замовлення. Спробуйте ще раз.',
  DETAILS_TITLE: 'Деталі замовлення',
  DETAILS_DESCRIPTION: 'Перегляд повної інформації про замовлення та його товари.',
  DETAILS_ORDER_TITLE: 'Замовлення',
  DETAILS_CREATED_PREFIX: 'Створено',
  GENERAL_INFO_TITLE: 'Загальна інформація',
  PRODUCTS_TITLE: 'Товари',
  SUMMARY_SUBTOTAL_LABEL: 'Проміжна сума',
  SUMMARY_DISCOUNT_LABEL: 'Знижка',
  SUMMARY_TOTAL_LABEL: 'Разом',
  CUSTOMER_TITLE: 'Клієнт і доставка',
  STATUSES_TITLE: 'Статуси',
  PAYMENT_STATUS_FIELD_LABEL: 'Оплата',
  ORDER_STATUS_FIELD_LABEL: 'Замовлення',
  SAVE_STATUSES_LABEL: 'Зберегти статуси',
  STATUSES_UPDATED_TITLE: 'Статуси замовлення оновлено',
  BUYER_TITLE: 'Покупець',
  ORDER_DETAILS_LOAD_ERROR: 'Не вдалося завантажити деталі замовлення.',
} as const;

export const ORDERS_SECTION_PATH = 'orders';
export const ORDERS_PAGE_SIZE = 20;
export const ORDERS_NUMBER_FILTER_ID = 'orders-number-filter';
export const ORDERS_SORT_ICON = 'swap_vert';
export const ORDERS_SHOW_ICON = 'visibility';
export const ORDER_NUMBER_PREFIX = '#';
export const ORDER_PAYMENT_STATUS_ICON = 'credit_card';
export const ORDER_STATUS_ICON = 'sync';
/** Prefix of the order number in the details title and breadcrumbs (`№4`). */
export const ORDER_DETAILS_NUMBER_PREFIX = '№';
/** Joins parts of the details description and the delivery value. */
export const ORDER_DETAILS_SEPARATOR = ' · ';
export const ORDER_DISCOUNT_SIGN = '−';
export const ORDER_NAME_SEPARATOR = ' ';
/** Item quantity used for the line total when the API omits it. */
export const ORDER_ITEM_DEFAULT_QUANTITY = 1;

export const ORDER_PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  [OrderPaymentMethod.Card]: 'Картка',
  [OrderPaymentMethod.Cod]: 'Накладений платіж',
  [OrderPaymentMethod.Manual]: 'Ручна оплата',
};

export const ORDER_SHIPPING_METHOD_LABELS: Record<OrderShippingMethod, string> = {
  [OrderShippingMethod.Nova]: 'Нова Пошта',
  [OrderShippingMethod.Ukr]: 'Укрпошта',
};

export const ORDERS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'newest' },
  { label: 'Спочатку старіші', value: 'older' },
];

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  [OrderPaymentStatus.Unpaid]: 'Не оплачено',
  [OrderPaymentStatus.Paid]: 'Оплачено',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Очікує',
  [OrderStatus.Processing]: 'В обробці',
  [OrderStatus.Shipped]: 'Відправлено',
  [OrderStatus.Cancelled]: 'Скасовано',
};

export const ORDER_PAYMENT_STATUS_OPTIONS: DropdownOption[] = [
  {
    label: ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Unpaid],
    value: OrderPaymentStatus.Unpaid,
  },
  { label: ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Paid], value: OrderPaymentStatus.Paid },
];

export const ORDER_STATUS_OPTIONS: DropdownOption[] = Object.values(OrderStatus).map((status) => ({
  label: ORDER_STATUS_LABELS[status],
  value: status,
}));

/** Badge tones keyed by the translated label shown in the cell. */
export const ORDER_PAYMENT_STATUS_BADGE_TONES: Record<string, BadgeTone> = {
  [ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Paid]]: 'success',
  [ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Unpaid]]: 'danger',
};

export const ORDER_STATUS_BADGE_TONES: Record<string, BadgeTone> = {
  [ORDER_STATUS_LABELS[OrderStatus.Pending]]: 'warning',
  [ORDER_STATUS_LABELS[OrderStatus.Processing]]: 'info',
  [ORDER_STATUS_LABELS[OrderStatus.Shipped]]: 'info',
  [ORDER_STATUS_LABELS[OrderStatus.Cancelled]]: 'danger',
};

export const ORDERS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'orderNumber', header: ORDERS_TEXTS.TABLE_NUMBER_HEADER, emphasis: true },
  { key: 'totalAmount', header: ORDERS_TEXTS.TABLE_TOTAL_HEADER, align: 'right', emphasis: true },
  {
    key: 'paymentStatus',
    header: ORDERS_TEXTS.TABLE_PAYMENT_STATUS_HEADER,
    badgeTones: ORDER_PAYMENT_STATUS_BADGE_TONES,
  },
  { key: 'status', header: ORDERS_TEXTS.TABLE_STATUS_HEADER, badgeTones: ORDER_STATUS_BADGE_TONES },
  { key: 'createdAt', header: ORDERS_TEXTS.TABLE_CREATED_AT_HEADER },
];

export const ORDER_ITEMS_TABLE_COLUMNS: TableColumn[] = [
  {
    key: 'name',
    header: ORDERS_TEXTS.ITEMS_PRODUCT_HEADER,
    emphasis: true,
    thumbnailKey: 'image',
  },
  { key: 'sku', header: ORDERS_TEXTS.ITEMS_SKU_HEADER, mono: true },
  { key: 'quantity', header: ORDERS_TEXTS.ITEMS_QUANTITY_HEADER, align: 'right' },
  { key: 'price', header: ORDERS_TEXTS.ITEMS_PRICE_HEADER, align: 'right' },
  { key: 'total', header: ORDERS_TEXTS.ITEMS_TOTAL_HEADER, align: 'right', emphasis: true },
];
