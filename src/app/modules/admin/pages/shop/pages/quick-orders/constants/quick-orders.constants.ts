import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { QuickOrderStatus } from '../models/quick-order-status.enum';
import { QuickOrderTab } from '../models/quick-order-tab.type';
import { QuickOrderTabOption } from '../models/quick-order-tab-option.model';

export const QUICK_ORDERS_TEXTS = {
  PAGE_TITLE: 'Швидкі замовлення',
  PAGE_DESCRIPTION:
    'Заявки «Купити в один клік». Зателефонуйте клієнту й позначте заявку як оброблену або скасуйте її.',
  SEARCH_FILTER_LABEL: "Ім'я або номер телефону",
  SEARCH_FILTER_PLACEHOLDER: 'Напр., Олена або 067 123 45 67',
  FILTER_APPLY_LABEL: 'Застосувати',
  FILTER_RESET_LABEL: 'Скинути',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/quick-orders), щоб керувати швидкими замовленнями.',
  TABS_LABEL: 'Статус заявок',
  TABLE_CREATED_AT_HEADER: 'Створено',
  TABLE_NAME_HEADER: "Ім'я",
  TABLE_PHONE_HEADER: 'Телефон',
  TABLE_PRODUCT_HEADER: 'Товар',
  TABLE_STATUS_HEADER: 'Статус',
  TABLE_ACTIONS_HEADER: 'Дії',
  TABLE_LOADING_TEXT: 'Завантаження швидких замовлень...',
  EMPTY_STATE: 'Швидких замовлень не знайдено.',
  PROCESS_LABEL: 'Позначити як оброблено',
  CANCEL_LABEL: 'Скасувати',
  RESTORE_LABEL: 'Повернути в нові',
  CALL_LABEL: 'Зателефонувати',
  OPEN_PRODUCT_LABEL: 'Відкрити товар',
  PAGINATION_LABEL: 'заявок',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити швидкі замовлення. Спробуйте ще раз.',
} as const;

export const QUICK_ORDERS_SECTION_PATH = 'quick-orders';
export const QUICK_ORDERS_PAGE_SIZE = 20;
/** Only `total` is needed for the tab counters, so one item per request is enough. */
export const QUICK_ORDERS_COUNT_LIMIT = 1;
export const QUICK_ORDERS_SEARCH_FILTER_ID = 'quick-orders-search-filter';
export const QUICK_ORDERS_ALL_TAB = 'all';
export const QUICK_ORDERS_DEFAULT_TAB: QuickOrderTab = QuickOrderStatus.New;

export const QUICK_ORDERS_ICONS = {
  PHONE: 'call',
  PROCESS: 'check',
  RESTORE: 'undo',
  PRODUCT: 'inventory_2',
} as const;

export const QUICK_ORDER_STATUS_LABELS: Record<QuickOrderStatus, string> = {
  [QuickOrderStatus.New]: 'Нове',
  [QuickOrderStatus.Processed]: 'Оброблено',
  [QuickOrderStatus.Cancelled]: 'Скасовано',
};

export const QUICK_ORDER_STATUS_BADGE_TONES: Record<QuickOrderStatus, BadgeTone> = {
  [QuickOrderStatus.New]: 'primary',
  [QuickOrderStatus.Processed]: 'success',
  [QuickOrderStatus.Cancelled]: 'danger',
};

/** Success toast shown after moving a request to the given status. */
export const QUICK_ORDER_STATUS_SUCCESS_TITLES: Record<QuickOrderStatus, string> = {
  [QuickOrderStatus.New]: 'Заявку повернуто в нові',
  [QuickOrderStatus.Processed]: 'Заявку позначено як оброблену',
  [QuickOrderStatus.Cancelled]: 'Заявку скасовано',
};

export const QUICK_ORDERS_TABS: QuickOrderTabOption[] = [
  { value: QuickOrderStatus.New, label: 'Нові' },
  { value: QuickOrderStatus.Processed, label: 'Оброблені' },
  { value: QuickOrderStatus.Cancelled, label: 'Скасовані' },
  { value: QUICK_ORDERS_ALL_TAB, label: 'Усі' },
];

export const QUICK_ORDER_DATE_LOCALE = 'uk-UA';
export const QUICK_ORDER_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};
export const QUICK_ORDER_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

/** `+380671234567` → groups for `+380 67 123 45 67`. */
export const QUICK_ORDER_PHONE_PATTERN = /^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/;
export const QUICK_ORDER_PHONE_FORMAT = '+380 $1 $2 $3 $4';
export const QUICK_ORDER_PHONE_HREF_PREFIX = 'tel:';
/** A search term made only of phone characters is searched by its digits (`067 123` → `067123`). */
export const QUICK_ORDER_PHONE_SEARCH_PATTERN = /^[\d\s()+-]+$/;
export const QUICK_ORDER_NON_DIGIT_PATTERN = /\D/g;
export const QUICK_ORDER_WHITESPACE_PATTERN = /\s/g;
