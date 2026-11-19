import { API_URL } from '@core/constants/api.constant';
import { NotificationTabOption } from '../models/notification-tab-option.model';
import { NotificationView } from '../models/notification-view.model';
import { NOTIFICATION_TYPES } from '../models/notification-type.enum';

export const NOTIFICATIONS_API_URL = `${API_URL}/notifications`;

export const NOTIFICATIONS_API_ENDPOINTS = {
  LIST: NOTIFICATIONS_API_URL,
  UNREAD_COUNT: `${NOTIFICATIONS_API_URL}/unread-count`,
  STREAM: `${NOTIFICATIONS_API_URL}/stream`,
  READ_ALL: `${NOTIFICATIONS_API_URL}/read-all`,
  read: (id: string) => `${NOTIFICATIONS_API_URL}/${id}/read`,
} as const;

/** The panel shows the latest page of each shop; older notifications stay on the server. */
export const NOTIFICATIONS_PAGE_SIZE = 20;
export const NOTIFICATIONS_FIRST_PAGE = 1;

/** SSE `event:` names sent by the API stream. */
export const NOTIFICATION_SSE_EVENTS = {
  NOTIFICATION: 'notification',
  HEARTBEAT: 'heartbeat',
} as const;

export const NOTIFICATION_SSE_FIELDS = {
  EVENT: 'event',
  DATA: 'data',
} as const;

/** Event name of a message that carries no `event:` line, per the SSE spec. */
export const NOTIFICATION_SSE_DEFAULT_EVENT = 'message';
export const NOTIFICATION_SSE_MESSAGE_SEPARATOR = '\n\n';
export const NOTIFICATION_SSE_LINE_SEPARATOR = '\n';
export const NOTIFICATION_SSE_LINE_ENDING_PATTERN = /\r\n?/g;
export const NOTIFICATION_SSE_ACCEPT = 'text/event-stream';

/** Reconnect backoff: 1s, 2s, 4s … capped at 30s. Reset after the stream delivers an event. */
export const NOTIFICATION_STREAM_RETRY_BASE_MS = 1000;
export const NOTIFICATION_STREAM_RETRY_MAX_MS = 30_000;
export const NOTIFICATION_STREAM_NETWORK_ERROR_STATUS = 0;

export const NOTIFICATION_TIME = {
  MINUTE_MS: 60_000,
  HOUR_MS: 3_600_000,
  LOCALE: 'uk-UA',
} as const;

export const NOTIFICATION_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

export const NOTIFICATION_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export const NOTIFICATIONS_TEXTS = {
  BELL_LABEL: 'Сповіщення',
  BELL_UNREAD_LABEL_SUFFIX: 'непрочитаних',
  PANEL_TITLE: 'Сповіщення',
  UNREAD_BADGE_SUFFIX: 'нових',
  READ_ALL: 'Прочитати всі',
  MARK_READ: 'Прочитано',
  UNREAD_DOT_LABEL: 'Непрочитане',
  LOADING_LABEL: 'Сповіщення завантажуються',
  ERROR_TEXT: 'Не вдалося завантажити сповіщення. Спробуйте пізніше.',
  EMPTY_TITLE: 'Усе прочитано',
  EMPTY_TEXT: "Нові замовлення й реєстрації користувачів з'являться тут.",
  GROUP_TODAY: 'Сьогодні',
  GROUP_EARLIER: 'Раніше',
  TABS_LABEL: 'Фільтр сповіщень',
  JUST_NOW: 'щойно',
  MINUTES_AGO: 'хв тому',
  HOURS_AGO: 'год тому',
  YESTERDAY: 'Вчора',
  META_SEPARATOR: ' · ',
  NAME_SEPARATOR: ' ',
  ORDER_CREATED_TITLE: 'Нове замовлення',
  ORDER_NUMBER_PREFIX: '№',
  ORDER_CREATED_FALLBACK_TEXT: 'Покупець оформив замовлення',
  CURRENCY: '₴',
  CUSTOMER_REGISTERED_TITLE: 'Новий користувач',
  CUSTOMER_REGISTERED_TEXT: 'зареєструвався в магазині',
  CUSTOMER_FALLBACK_NAME: 'Користувач',
  UNKNOWN_TITLE: 'Сповіщення',
  OPEN_ORDER: 'Відкрити замовлення',
  OPEN_USER: 'Відкрити користувача',
} as const;

export const NOTIFICATIONS_TABS: NotificationTabOption[] = [
  { value: 'all', label: 'Усі' },
  { value: 'unread', label: 'Непрочитані' },
  { value: 'orders', label: 'Замовлення' },
];

export const NOTIFICATIONS_ICONS = {
  BELL: 'notifications',
  READ_ALL: 'done_all',
  EMPTY: 'done_all',
  UNKNOWN: 'notifications',
} as const;

export const NOTIFICATION_VIEWS: NotificationView[] = [
  {
    type: NOTIFICATION_TYPES.ORDER_CREATED,
    icon: 'receipt_long',
    tone: 'primary',
    actionLabel: NOTIFICATIONS_TEXTS.OPEN_ORDER,
  },
  {
    type: NOTIFICATION_TYPES.CUSTOMER_REGISTERED,
    icon: 'person_add',
    tone: 'info',
    actionLabel: NOTIFICATIONS_TEXTS.OPEN_USER,
  },
];

/** Route segments under `/admin/shop/:shopId/` that notifications link to. */
export const NOTIFICATION_LINK_SECTIONS = {
  ORDERS: 'orders',
  USERS: 'users',
} as const;

/** Skeleton rows shown while the first page loads. */
export const NOTIFICATIONS_SKELETON_ROWS = [1, 2, 3] as const;
