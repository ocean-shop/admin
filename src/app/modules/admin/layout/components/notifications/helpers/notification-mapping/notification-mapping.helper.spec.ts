import { APP_ROUTES } from '@core/constants/routes.constants';
import {
  NOTIFICATION_DATE_FORMAT,
  NOTIFICATION_TIME,
  NOTIFICATION_TIME_FORMAT,
  NOTIFICATIONS_ICONS,
  NOTIFICATIONS_TEXTS,
} from '../../constants/notifications.constants';
import {
  NotificationApiItem,
  NotificationsListResponse,
} from '../../models/notification-api.model';
import { NotificationItem } from '../../models/notification-item.model';
import {
  filterNotifications,
  formatNotificationTime,
  groupNotifications,
  mapNotification,
  markNotificationReadInList,
} from './notification-mapping.helper';

const NOW = new Date(2026, 10, 13, 15, 0, 0).getTime();
const at = (hours: number, minutes = 0, dayOffset = 0): number =>
  new Date(2026, 10, 13 + dayOffset, hours, minutes, 0).getTime();

const buildItem = (overrides: Partial<NotificationItem> = {}): NotificationItem => ({
  id: 'n1',
  shopId: 's1',
  isOrder: true,
  isRead: false,
  isToday: true,
  createdAt: NOW,
  icon: 'receipt_long',
  tone: 'primary',
  title: 'title',
  text: 'text',
  meta: 'meta',
  link: null,
  actionLabel: null,
  ...overrides,
});

describe('notification-mapping helper', () => {
  describe('formatNotificationTime', () => {
    it('returns an empty string for unknown time', () => {
      expect(formatNotificationTime(0, NOW)).toBe('');
    });

    it('formats today as just now / minutes / hours ago', () => {
      expect(formatNotificationTime(NOW - 10_000, NOW)).toBe(NOTIFICATIONS_TEXTS.JUST_NOW);
      expect(formatNotificationTime(at(14, 55), NOW)).toBe(`5 ${NOTIFICATIONS_TEXTS.MINUTES_AGO}`);
      expect(formatNotificationTime(at(12, 30), NOW)).toBe(`2 ${NOTIFICATIONS_TEXTS.HOURS_AGO}`);
    });

    it('treats future timestamps (clock skew) as just now', () => {
      expect(formatNotificationTime(NOW + NOTIFICATION_TIME.MINUTE_MS / 2, NOW)).toBe(
        NOTIFICATIONS_TEXTS.JUST_NOW,
      );
    });

    it('formats yesterday with the clock time', () => {
      const time = at(17, 40, -1);
      const clock = new Date(time).toLocaleTimeString(
        NOTIFICATION_TIME.LOCALE,
        NOTIFICATION_TIME_FORMAT,
      );

      expect(formatNotificationTime(time, NOW)).toBe(`${NOTIFICATIONS_TEXTS.YESTERDAY}, ${clock}`);
    });

    it('formats older notifications as a full date', () => {
      const time = at(9, 0, -5);

      expect(formatNotificationTime(time, NOW)).toBe(
        new Date(time).toLocaleString(NOTIFICATION_TIME.LOCALE, NOTIFICATION_DATE_FORMAT),
      );
    });
  });

  describe('mapNotification', () => {
    it('maps an order notification with number, customer, amount and link', () => {
      const api: NotificationApiItem = {
        id: 'n1',
        shopId: 's1',
        type: 'order_created',
        createdAt: new Date(at(14, 58)).toISOString(),
        isRead: false,
        payload: {
          orderId: 'o1',
          orderNumber: 5,
          totalAmount: '1337.00',
          firstName: ' Олена ',
          lastName: 'Коваль',
        },
      };

      expect(mapNotification(api, ' Shop 1 ', NOW)).toEqual({
        id: 'n1',
        shopId: 's1',
        isOrder: true,
        isRead: false,
        isToday: true,
        createdAt: at(14, 58),
        icon: 'receipt_long',
        tone: 'primary',
        title: `${NOTIFICATIONS_TEXTS.ORDER_CREATED_TITLE} ${NOTIFICATIONS_TEXTS.ORDER_NUMBER_PREFIX}5`,
        text: `Олена Коваль${NOTIFICATIONS_TEXTS.META_SEPARATOR}1337.00 ${NOTIFICATIONS_TEXTS.CURRENCY}`,
        meta: `2 ${NOTIFICATIONS_TEXTS.MINUTES_AGO}${NOTIFICATIONS_TEXTS.META_SEPARATOR}Shop 1`,
        link: `${APP_ROUTES.ADMIN_SHOP}/s1/orders/o1`,
        actionLabel: NOTIFICATIONS_TEXTS.OPEN_ORDER,
      });
    });

    it('falls back for an order without number, customer, amount or id', () => {
      const item = mapNotification(
        { id: 'n1', shopId: 's1', type: 'order_created', payload: null, isRead: true },
        '',
        NOW,
      );

      expect(item.title).toBe(NOTIFICATIONS_TEXTS.ORDER_CREATED_TITLE);
      expect(item.text).toBe(NOTIFICATIONS_TEXTS.ORDER_CREATED_FALLBACK_TEXT);
      expect(item.link).toBeNull();
      expect(item.actionLabel).toBeNull();
      expect(item.isRead).toBe(true);
      expect(item.isToday).toBe(false);
      expect(item.meta).toBe('');
    });

    it('maps a customer registration with email, phone or a fallback contact', () => {
      const base: NotificationApiItem = {
        id: 'n2',
        shopId: 's1',
        type: 'customer_registered',
        createdAt: new Date(at(9, 0, -1)).toISOString(),
      };

      const withEmail = mapNotification(
        { ...base, payload: { userId: 'u1', email: 'a@b.c', mobileNumber: '+380' } },
        'Shop',
        NOW,
      );
      expect(withEmail.title).toBe(NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TITLE);
      expect(withEmail.text).toBe(`a@b.c ${NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TEXT}`);
      expect(withEmail.link).toBe(`${APP_ROUTES.ADMIN_SHOP}/s1/users/u1`);
      expect(withEmail.actionLabel).toBe(NOTIFICATIONS_TEXTS.OPEN_USER);
      expect(withEmail.isOrder).toBe(false);
      expect(withEmail.tone).toBe('info');

      expect(mapNotification({ ...base, payload: { mobileNumber: '+380' } }, '', NOW).text).toBe(
        `+380 ${NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TEXT}`,
      );
      expect(mapNotification({ ...base, payload: {} }, '', NOW).text).toBe(
        `${NOTIFICATIONS_TEXTS.CUSTOMER_FALLBACK_NAME} ${NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TEXT}`,
      );
    });

    it('maps an unknown type to a neutral generic notification', () => {
      const item = mapNotification(
        { id: 'n3', shopId: 's1', type: 'something_else', createdAt: 'not a date' },
        'Shop',
        NOW,
      );

      expect(item.title).toBe(NOTIFICATIONS_TEXTS.UNKNOWN_TITLE);
      expect(item.icon).toBe(NOTIFICATIONS_ICONS.UNKNOWN);
      expect(item.tone).toBe('neutral');
      expect(item.createdAt).toBe(0);
      expect(item.text).toBe('');
    });
  });

  describe('filterNotifications', () => {
    const order = buildItem({ id: 'order', createdAt: 1 });
    const user = buildItem({ id: 'user', isOrder: false, createdAt: 2 });

    it('sorts newest first', () => {
      expect(filterNotifications([order, user], 'all').map((item) => item.id)).toEqual([
        'user',
        'order',
      ]);
      expect(filterNotifications([order, user], 'unread')).toHaveLength(2);
    });

    it('keeps only orders on the orders tab', () => {
      expect(filterNotifications([order, user], 'orders')).toEqual([order]);
    });
  });

  describe('groupNotifications', () => {
    it('splits today and earlier and drops empty groups', () => {
      const today = buildItem({ id: 't' });
      const earlier = buildItem({ id: 'e', isToday: false });

      expect(groupNotifications([today, earlier])).toEqual([
        { label: NOTIFICATIONS_TEXTS.GROUP_TODAY, items: [today] },
        { label: NOTIFICATIONS_TEXTS.GROUP_EARLIER, items: [earlier] },
      ]);
      expect(groupNotifications([earlier])).toEqual([
        { label: NOTIFICATIONS_TEXTS.GROUP_EARLIER, items: [earlier] },
      ]);
      expect(groupNotifications([])).toEqual([]);
    });
  });

  describe('markNotificationReadInList', () => {
    const response: NotificationsListResponse = {
      items: [
        { id: 'a', shopId: 's1', isRead: false },
        { id: 'b', shopId: 's1', isRead: false },
      ],
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    it('returns undefined when nothing is cached', () => {
      expect(markNotificationReadInList(undefined, 'a', false)).toBeUndefined();
    });

    it('flags the item as read in a full list', () => {
      const result = markNotificationReadInList(response, 'a', false);

      expect(result?.items.map((item) => item.isRead)).toEqual([true, false]);
      expect(result?.total).toBe(2);
    });

    it('removes the item from an unread-only list', () => {
      const result = markNotificationReadInList(response, 'a', true);

      expect(result?.items.map((item) => item.id)).toEqual(['b']);
      expect(result?.total).toBe(1);
    });
  });
});
