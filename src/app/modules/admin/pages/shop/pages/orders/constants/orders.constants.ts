import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { TableColumn } from '@ui/table/models/table-column.model';
import { OrderPaymentStatus } from '../models/order-payment-status.enum';
import { OrderStatus } from '../models/order-status.enum';

export const ORDERS_TEXTS = {
  ORDER_ITEMS_EMPTY_STATE: 'Товари замовлення відсутні.',
  INFO_ORDER_NUMBER_LABEL: 'Номер Замовлення',
  INFO_AMOUNT_LABEL: 'Сума',
  INFO_PAYMENT_STATUS_LABEL: 'Статус оплати',
  INFO_ORDER_STATUS_LABEL: 'Статус Замовлення',
  INFO_CREATED_LABEL: 'Створено',
  INFO_UPDATED_LABEL: 'Оновлено',
  USER_EMAIL_LABEL: 'Email',
  USER_FIRST_NAME_LABEL: "Ім'я",
  USER_LAST_NAME_LABEL: 'Прізвище',
  USER_PHONE_LABEL: 'Телефон',
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
  ITEMS_QUANTITY_HEADER: 'Кількість',
  ITEMS_PRICE_HEADER: 'Ціна Товару',
  ITEMS_TOTAL_HEADER: 'Загальна Сума',
  MODAL_DELETE_TITLE: 'Видалити замовлення',
  MODAL_DELETE_MESSAGE: 'Ви справді хочете видалити замовлення ',
  MODAL_DELETE_MESSAGE_SUFFIX: '? Цю дію не можна скасувати.',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  PAGINATION_LABEL: 'замовлень',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити замовлення. Спробуйте ще раз.',
  DETAILS_TITLE: 'Деталі замовлення',
  DETAILS_DESCRIPTION: 'Перегляд повної інформації про замовлення та його товари.',
  GENERAL_INFO_TITLE: 'Загальна інформація',
  PRODUCTS_TITLE: 'Товари замовлення',
  USER_TITLE: 'Користувач',
  EXTRA_DATA_TITLE: 'Додаткові дані',
  PAYMENT_STATUS_LABEL: 'Статус оплати',
  ORDER_STATUS_LABEL: 'Статус замовлення',
  SAVE_PAYMENT_STATUS_LABEL: 'Зберегти оплату',
  SAVE_STATUS_LABEL: 'Зберегти статус',
  PAYMENT_STATUS_UPDATED_TITLE: 'Статус оплати оновлено',
  ORDER_STATUS_UPDATED_TITLE: 'Статус замовлення оновлено',
  ORDER_DETAILS_LOAD_ERROR: 'Не вдалося завантажити деталі замовлення.',
} as const;

export const ORDERS_SECTION_PATH = 'orders';
export const ORDERS_PAGE_SIZE = 20;
export const ORDERS_NUMBER_FILTER_ID = 'orders-number-filter';
export const ORDERS_SORT_ICON = 'swap_vert';
export const ORDER_NUMBER_PREFIX = '#';
export const ORDER_PAYMENT_STATUS_ICON = 'credit_card';
export const ORDER_STATUS_ICON = 'sync';
/** Item quantity used for the line total when the API omits it. */
export const ORDER_ITEM_DEFAULT_QUANTITY = 1;

export const ORDERS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'newest' },
  { label: 'Спочатку старіші', value: 'older' },
];

export const ORDER_PAYMENT_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Не оплачено', value: OrderPaymentStatus.Unpaid },
  { label: 'Оплачено', value: OrderPaymentStatus.Paid },
];

export const ORDER_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Очікує', value: OrderStatus.Pending },
  { label: 'В обробці', value: OrderStatus.Processing },
  { label: 'Відправлено', value: OrderStatus.Shipped },
  { label: 'Скасовано', value: OrderStatus.Cancelled },
];

export const ORDERS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'orderNumber', header: ORDERS_TEXTS.TABLE_NUMBER_HEADER },
  { key: 'totalAmount', header: ORDERS_TEXTS.TABLE_TOTAL_HEADER, align: 'right' },
  { key: 'paymentStatus', header: ORDERS_TEXTS.TABLE_PAYMENT_STATUS_HEADER },
  { key: 'status', header: ORDERS_TEXTS.TABLE_STATUS_HEADER },
  { key: 'createdAt', header: ORDERS_TEXTS.TABLE_CREATED_AT_HEADER },
];

export const ORDER_ITEMS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', header: ORDERS_TEXTS.ITEMS_PRODUCT_HEADER },
  { key: 'sku', header: ORDERS_TEXTS.ITEMS_SKU_HEADER },
  { key: 'quantity', header: ORDERS_TEXTS.ITEMS_QUANTITY_HEADER, align: 'right' },
  { key: 'price', header: ORDERS_TEXTS.ITEMS_PRICE_HEADER, align: 'right' },
  { key: 'total', header: ORDERS_TEXTS.ITEMS_TOTAL_HEADER, align: 'right' },
];

/** Order fields rendered in dedicated sections; everything else goes to "extra data". */
export const ORDER_KNOWN_FIELDS: readonly string[] = [
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
];
