import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { AdminsService } from '../../../pages/admins/services/admins/admins.service';
import { SHOP_QUERY_KEYS } from '../../../pages/shop/constants/shop-query-keys.constants';
import { NOTIFICATIONS_QUERY_KEYS } from './constants/notifications-query-keys.constants';
import { NOTIFICATIONS_TEXTS } from './constants/notifications.constants';
import { NotificationApiItem, NotificationsListResponse } from './models/notification-api.model';
import { Notifications } from './notifications';
import { NotificationStreamService } from './services/notification-stream/notification-stream.service';
import { NotificationsService } from './services/notifications/notifications.service';

const todayIso = (): string => new Date(Date.now() - 60_000 * 5).toISOString();

const ORDER: NotificationApiItem = {
  id: 'n1',
  shopId: 's1',
  type: 'order_created',
  createdAt: todayIso(),
  isRead: false,
  payload: { orderId: 'o1', orderNumber: '5', totalAmount: '10.00' },
};

const USER: NotificationApiItem = {
  id: 'n2',
  shopId: 's2',
  type: 'customer_registered',
  createdAt: '2020-01-01T10:00:00.000Z',
  isRead: true,
  payload: { userId: 'u1', email: 'a@b.c' },
};

const listOf = (items: NotificationApiItem[]): NotificationsListResponse => ({
  items,
  total: items.length,
  page: 1,
  limit: 20,
  totalPages: 1,
});

describe('Notifications', () => {
  let fixture: ComponentFixture<Notifications>;
  let element: HTMLElement;
  let notificationsService: {
    getNotifications: ReturnType<typeof vi.fn>;
    getUnreadCount: ReturnType<typeof vi.fn>;
    markAsRead: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
  };
  let streams: Record<string, Subject<NotificationApiItem>>;
  let queryClient: QueryClient;
  let navigateSpy: ReturnType<typeof vi.spyOn>;
  let currentUserId: string | null;

  const bell = (): HTMLButtonElement =>
    element.querySelector('#notifications-toggle') as HTMLButtonElement;
  const panel = (): HTMLElement | null => element.querySelector('.notifications-panel');
  const titles = (): string[] =>
    Array.from(element.querySelectorAll('.notification-title')).map(
      (node) => node.textContent?.trim() ?? '',
    );

  const create = async (userId: string | null = 'admin-1'): Promise<void> => {
    currentUserId = userId;
    fixture = TestBed.createComponent(Notifications);
    element = fixture.nativeElement as HTMLElement;
    queryClient = TestBed.inject(QueryClient);
    // The admin query resolves first, then the per-shop count queries start.
    await flushQueries(fixture);
    await flushQueries(fixture);
  };

  const open = async (): Promise<void> => {
    bell().click();
    await flushQueries(fixture);
  };

  beforeEach(async () => {
    streams = { s1: new Subject(), s2: new Subject() };
    notificationsService = {
      getNotifications: vi.fn(({ shopId }: { shopId: string }) =>
        of(listOf(shopId === 's1' ? [ORDER] : [USER])),
      ),
      getUnreadCount: vi.fn((shopId: string) => of({ count: shopId === 's1' ? 1 : 0 })),
      markAsRead: vi.fn(() => of(undefined)),
      markAllAsRead: vi.fn(() => of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...provideTestQueryClient(),
        { provide: AuthService, useValue: { getUserId: () => currentUserId } },
        {
          provide: AdminsService,
          useValue: {
            getAdminById: vi.fn(() =>
              of({
                id: 'admin-1',
                shops: [
                  { id: 's1', name: 'Shop 1' },
                  { id: 's2', name: 'Shop 2' },
                ],
              }),
            ),
          },
        },
        { provide: NotificationsService, useValue: notificationsService },
        {
          provide: NotificationStreamService,
          useValue: { connect: vi.fn((shopId: string) => streams[shopId]) },
        },
      ],
    }).compileComponents();

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('shows the unread count on the bell without loading lists', async () => {
    await create();

    expect(element.querySelector('.notifications-bell-count')?.textContent?.trim()).toBe('1');
    expect(bell().getAttribute('aria-label')).toBe(
      `${NOTIFICATIONS_TEXTS.BELL_LABEL}, 1 ${NOTIFICATIONS_TEXTS.BELL_UNREAD_LABEL_SUFFIX}`,
    );
    expect(notificationsService.getNotifications).not.toHaveBeenCalled();
    expect(panel()).toBeNull();
  });

  it('shows a plain bell when the user is unknown', async () => {
    await create(null);

    expect(element.querySelector('.notifications-bell-count')).toBeNull();
    expect(bell().getAttribute('aria-label')).toBe(NOTIFICATIONS_TEXTS.BELL_LABEL);
  });

  it('opens the panel with grouped notifications of every shop', async () => {
    await create();
    await open();

    expect(panel()).toBeTruthy();
    expect(bell().getAttribute('aria-expanded')).toBe('true');
    expect(titles()).toEqual([
      `${NOTIFICATIONS_TEXTS.ORDER_CREATED_TITLE} ${NOTIFICATIONS_TEXTS.ORDER_NUMBER_PREFIX}5`,
      NOTIFICATIONS_TEXTS.CUSTOMER_REGISTERED_TITLE,
    ]);
    const groups = Array.from(element.querySelectorAll('.notifications-group')).map((node) =>
      node.textContent?.trim(),
    );
    expect(groups).toEqual([NOTIFICATIONS_TEXTS.GROUP_TODAY, NOTIFICATIONS_TEXTS.GROUP_EARLIER]);
    expect(element.textContent).toContain(`1 ${NOTIFICATIONS_TEXTS.UNREAD_BADGE_SUFFIX}`);
    expect(element.textContent).toContain('Shop 2');
  });

  it('loads unread-only lists on the unread tab and filters orders on the orders tab', async () => {
    await create();
    await open();
    const tabs = element.querySelectorAll<HTMLButtonElement>('.notifications-tab');

    tabs[1].click();
    await flushQueries(fixture);
    expect(notificationsService.getNotifications).toHaveBeenCalledWith(
      expect.objectContaining({ shopId: 's1', unreadOnly: true }),
    );
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');

    tabs[2].click();
    await flushQueries(fixture);
    expect(titles()).toHaveLength(1);
  });

  it('shows the empty state when there are no notifications', async () => {
    notificationsService.getNotifications.mockReturnValue(of(listOf([])));
    notificationsService.getUnreadCount.mockReturnValue(of({ count: 0 }));
    await create();
    await open();

    expect(element.querySelector('.notifications-empty-title')?.textContent).toContain(
      NOTIFICATIONS_TEXTS.EMPTY_TITLE,
    );
    const readAll = element.querySelector('.notifications-read-all button') as HTMLButtonElement;
    expect(readAll.disabled).toBe(true);
  });

  it('shows the error message when a list fails', async () => {
    notificationsService.getNotifications.mockReturnValue(throwError(() => new Error('fail')));
    await create();
    await open();

    expect(element.textContent).toContain(NOTIFICATIONS_TEXTS.ERROR_TEXT);
  });

  it('shows skeletons while lists load', async () => {
    notificationsService.getNotifications.mockReturnValue(new Subject());
    await create();
    await open();

    expect(element.querySelectorAll('.notifications-skeleton-row')).toHaveLength(3);
  });

  it('marks an unread item as read and navigates to its entity', async () => {
    await create();
    await open();

    (element.querySelector('.notification-title') as HTMLButtonElement).click();
    await flushQueries(fixture);

    expect(notificationsService.markAsRead).toHaveBeenCalledWith('n1');
    expect(navigateSpy).toHaveBeenCalledWith('/admin/shop/s1/orders/o1');
    expect(panel()).toBeNull();
  });

  it('does not mark an already read item again', async () => {
    await create();
    await open();

    (element.querySelectorAll('.notification-title')[1] as HTMLButtonElement).click();
    await flushQueries(fixture);

    expect(notificationsService.markAsRead).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/admin/shop/s2/users/u1');
  });

  it('marks as read without navigating and patches the cached list', async () => {
    await create();
    await open();
    const setSpy = vi.spyOn(queryClient, 'setQueryData');

    (
      element.querySelectorAll('.notification-actions app-button button')[1] as HTMLButtonElement
    ).click();
    await flushQueries(fixture);

    expect(notificationsService.markAsRead).toHaveBeenCalledWith('n1');
    expect(setSpy).toHaveBeenCalledWith(
      NOTIFICATIONS_QUERY_KEYS.list('s1', false),
      expect.any(Function),
    );
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(panel()).toBeTruthy();
  });

  it('reads all only for shops with unread notifications', async () => {
    await create();
    await open();

    (element.querySelector('.notifications-read-all button') as HTMLButtonElement).click();
    await flushQueries(fixture);

    expect(notificationsService.markAllAsRead).toHaveBeenCalledTimes(1);
    expect(notificationsService.markAllAsRead).toHaveBeenCalledWith('s1');
  });

  it('skips read all when nothing is unread', async () => {
    notificationsService.getUnreadCount.mockReturnValue(of({ count: 0 }));
    await create();

    (fixture.componentInstance as any).readAll();

    expect(notificationsService.markAllAsRead).not.toHaveBeenCalled();
  });

  it('refetches the shop on a live notification and refreshes orders for new orders', async () => {
    await create();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    streams['s1'].next(ORDER);
    streams['s2'].next(USER);

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: NOTIFICATIONS_QUERY_KEYS.shopScope('s1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SHOP_QUERY_KEYS.ordersScope('s1') });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: NOTIFICATIONS_QUERY_KEYS.shopScope('s2'),
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: SHOP_QUERY_KEYS.ordersScope('s2'),
    });
  });

  it('closes on outside click and Escape, but not on clicks inside', async () => {
    await create();
    await open();

    (panel() as HTMLElement).click();
    await fixture.whenStable();
    expect(panel()).toBeTruthy();

    document.body.click();
    await fixture.whenStable();
    expect(panel()).toBeNull();

    await open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it('closes when the bell is clicked again', async () => {
    await create();
    await open();
    await open();

    expect(panel()).toBeNull();
  });
});
