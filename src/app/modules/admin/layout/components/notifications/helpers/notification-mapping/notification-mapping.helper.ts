import { APP_ROUTES } from '@core/constants/routes.constants';
import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import {
  NOTIFICATION_DATE_FORMAT,
  NOTIFICATION_LINK_SECTIONS,
  NOTIFICATION_TIME,
  NOTIFICATION_TIME_FORMAT,
  NOTIFICATION_VIEWS,
  NOTIFICATIONS_ICONS,
  NOTIFICATIONS_TEXTS,
} from '../../constants/notifications.constants';
import {
  NotificationApiItem,
  NotificationPayloadApi,
  NotificationsListResponse,
} from '../../models/notification-api.model';
import { NotificationGroup } from '../../models/notification-group.model';
import { NotificationItem } from '../../models/notification-item.model';
import { NotificationTab } from '../../models/notification-tab.type';
import { NOTIFICATION_TYPES } from '../../models/notification-type.enum';

const joinFilled = (parts: string[], separator: string): string =>
  parts.filter(Boolean).join(separator);

const startOfDay = (time: number): number => new Date(time).setHours(0, 0, 0, 0);

const parseTime = (value: string | null | undefined): number => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

const isSameDay = (left: number, right: number): boolean => startOfDay(left) === startOfDay(right);

const isYesterday = (time: number, now: number): boolean => {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(time, yesterday.getTime());
};

/** "щойно", "5 хв тому", "2 год тому", "Вчора, 17:40" or a full date for older notifications. */
export const formatNotificationTime = (time: number, now: number): string => {
  if (!time) {
    return '';
  }

  const diff = Math.max(0, now - time);
  const today = isSameDay(time, now);

  if (today && diff < NOTIFICATION_TIME.MINUTE_MS) {
    return NOTIFICATIONS_TEXTS.JUST_NOW;
  }

  if (today && diff < NOTIFICATION_TIME.HOUR_MS) {
    return `${Math.floor(diff / NOTIFICATION_TIME.MINUTE_MS)} ${NOTIFICATIONS_TEXTS.MINUTES_AGO}`;
  }

  if (today) {
    return `${Math.floor(diff / NOTIFICATION_TIME.HOUR_MS)} ${NOTIFICATIONS_TEXTS.HOURS_AGO}`;
  }

  const date = new Date(time);
  if (isYesterday(time, now)) {
    const clock = date.toLocaleTimeString(NOTIFICATION_TIME.LOCALE, NOTIFICATION_TIME_FORMAT);
    return `${NOTIFICATIONS_TEXTS.YESTERDAY}, ${clock}`;
  }

  return date.toLocaleString(NOTIFICATION_TIME.LOCALE, NOTIFICATION_DATE_FORMAT);
};

const buildOrderTitle = (payload: NotificationPayloadApi): string => {
  const orderNumber = toTrimmedString(payload.orderNumber);
  return orderNumber
    ? `${NOTIFICATIONS_TEXTS.ORDER_CREATED_TITLE} ${NOTIFICATIONS_TEXTS.ORDER_NUMBER_PREFIX}${orderNumber}`
    : NOTIFICATIONS_TEXTS.ORDER_CREATED_TITLE;
};

const buildOrderText = (payload: NotificationPayloadApi): string => {
  const customer = joinFilled(
    [toTrimmedString(payload.firstName), toTrimmedString(payload.lastName)],
    NOTIFICATIONS_TEXTS.NAME_SEPARATOR,
  );
  const amount = toTrimmedString(payload.totalAmount);
  const text = joinFilled(
    [customer, amount && `${amount} ${NOTIFICATIONS_TEXTS.CURRENCY}`],
    NOTIFICATIONS_TEXTS.META_SEPARATOR,
  );

  return text || NOTIFICATIONS_TEXTS.ORDER_CREATED_FALLBACK_TEXT;
};

const buildCustomerText = (payload: NotificationPayloadApi): string => {
  const contact =
    toTrimmedString(payload.email) ||
    toTrimmedString(payload.mobileNumber) ||
    NOTIFICATIONS_TEXTS.CUSTOMER_FALLBACK_NAME;
  return `${contact} ${NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TEXT}`;
};

const buildShopLink = (shopId: string, section: string, entityId: string): string | null =>
  entityId ? `${APP_ROUTES.ADMIN_SHOP}/${shopId}/${section}/${entityId}` : null;

/** API notification → panel item. `shopName` goes into the meta line, `now` drives relative time. */
export const mapNotification = (
  item: NotificationApiItem,
  shopName: string,
  now: number,
): NotificationItem => {
  const payload = item.payload ?? {};
  const createdAt = parseTime(item.createdAt);
  const view = NOTIFICATION_VIEWS.find((entry) => entry.type === item.type);
  const isOrder = item.type === NOTIFICATION_TYPES.ORDER_CREATED;

  let title: string = NOTIFICATIONS_TEXTS.UNKNOWN_TITLE;
  let text = '';
  let link: string | null = null;

  if (isOrder) {
    title = buildOrderTitle(payload);
    text = buildOrderText(payload);
    link = buildShopLink(
      item.shopId,
      NOTIFICATION_LINK_SECTIONS.ORDERS,
      toTrimmedString(payload.orderId),
    );
  } else if (item.type === NOTIFICATION_TYPES.CUSTOMER_REGISTERED) {
    title = NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TITLE;
    text = buildCustomerText(payload);
    link = buildShopLink(
      item.shopId,
      NOTIFICATION_LINK_SECTIONS.USERS,
      toTrimmedString(payload.userId),
    );
  }

  return {
    id: item.id,
    shopId: item.shopId,
    isOrder,
    isRead: item.isRead === true,
    isToday: createdAt > 0 && isSameDay(createdAt, now),
    createdAt,
    icon: view?.icon ?? NOTIFICATIONS_ICONS.UNKNOWN,
    tone: view?.tone ?? 'neutral',
    title,
    text,
    meta: joinFilled(
      [formatNotificationTime(createdAt, now), shopName.trim()],
      NOTIFICATIONS_TEXTS.META_SEPARATOR,
    ),
    link,
    actionLabel: link ? (view?.actionLabel ?? null) : null,
  };
};

/** Items of the active tab, newest first. The unread tab is already filtered by the API. */
export const filterNotifications = (
  items: NotificationItem[],
  tab: NotificationTab,
): NotificationItem[] =>
  items
    .filter((item) => tab !== 'orders' || item.isOrder)
    .sort((left, right) => right.createdAt - left.createdAt);

/** "Сьогодні" / "Раніше" groups; empty groups are dropped. */
export const groupNotifications = (items: NotificationItem[]): NotificationGroup[] =>
  [
    { label: NOTIFICATIONS_TEXTS.GROUP_TODAY, items: items.filter((item) => item.isToday) },
    { label: NOTIFICATIONS_TEXTS.GROUP_EARLIER, items: items.filter((item) => !item.isToday) },
  ].filter((group) => group.items.length > 0);

/** Cache patch after mark-as-read: flags the item, or drops it from an unread-only list. */
export const markNotificationReadInList = (
  response: NotificationsListResponse | undefined,
  id: string,
  unreadOnly: boolean,
): NotificationsListResponse | undefined => {
  if (!response) {
    return response;
  }

  const items = unreadOnly
    ? response.items.filter((item) => item.id !== id)
    : response.items.map((item) => (item.id === id ? { ...item, isRead: true } : item));

  return { ...response, items, total: response.total - (response.items.length - items.length) };
};
