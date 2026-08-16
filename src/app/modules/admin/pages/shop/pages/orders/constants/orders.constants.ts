import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { OrderPaymentStatus } from '../models/order-payment-status.enum';
import { OrderStatus } from '../models/order-status.enum';

export const ORDERS_TEXTS = {
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
  UPDATE_PAYMENT_STATUS_ERROR_TITLE: 'Не вдалося оновити оплату',
  UPDATE_PAYMENT_STATUS_ERROR_MESSAGE:
    'Спробуйте ще раз або перевірте, чи замовлення доступне для редагування.',
  UPDATE_STATUS_ERROR_TITLE: 'Не вдалося оновити статус замовлення',
  UPDATE_STATUS_ERROR_MESSAGE:
    'Спробуйте ще раз або перевірте, чи замовлення доступне для редагування.',
  ORDER_DETAILS_LOAD_ERROR: 'Не вдалося завантажити деталі замовлення.',
};

export const ORDERS_PAGE_SIZE = 20;
export const ORDERS_NUMBER_FILTER_ID = 'orders-number-filter';

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
