import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { injectQueries } from '@tanstack/angular-query-experimental/inject-queries-experimental';
import { lastValueFrom, merge, switchMap } from 'rxjs';
import { areStringListsEqual } from '@core/helpers/array/array.helper';
import { AuthService } from '@core/services/auth/auth.service';
import { Badge } from '@ui/badge/badge';
import { Button } from '@ui/button/button';
import { StateMessage } from '@ui/state-message/state-message';
import { ADMINS_QUERY_KEYS } from '../../../pages/admins/constants/admins-query-keys.constants';
import { extractAdminShops } from '../../../pages/admins/helpers/admin-mapping/admin-mapping.helper';
import { AdminsService } from '../../../pages/admins/services/admins/admins.service';
import { SHOP_QUERY_KEYS } from '../../../pages/shop/constants/shop-query-keys.constants';
import { NotificationItem } from './components/notification-item/notification-item';
import { NOTIFICATIONS_QUERY_KEYS } from './constants/notifications-query-keys.constants';
import {
  NOTIFICATIONS_FIRST_PAGE,
  NOTIFICATIONS_ICONS,
  NOTIFICATIONS_PAGE_SIZE,
  NOTIFICATIONS_SKELETON_ROWS,
  NOTIFICATIONS_TABS,
  NOTIFICATIONS_TEXTS,
} from './constants/notifications.constants';
import {
  filterNotifications,
  groupNotifications,
  mapNotification,
  markNotificationReadInList,
} from './helpers/notification-mapping/notification-mapping.helper';
import { NotificationApiItem, NotificationsListResponse } from './models/notification-api.model';
import { NotificationItem as NotificationItemData } from './models/notification-item.model';
import { NotificationMarkReadVariables } from './models/notification-mark-read-variables.model';
import { NotificationTab } from './models/notification-tab.type';
import { NOTIFICATION_TYPES } from './models/notification-type.enum';
import { NotificationStreamService } from './services/notification-stream/notification-stream.service';
import { NotificationsService } from './services/notifications/notifications.service';

/**
 * Header bell with the notifications panel. Notifications are per shop on the API, so the panel
 * merges the latest page of every shop the admin manages and keeps one live stream per shop.
 */
@Component({
  selector: 'app-notifications',
  imports: [Badge, Button, StateMessage, NotificationItem],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class Notifications {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly adminsService = inject(AdminsService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly streamService = inject(NotificationStreamService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = NOTIFICATIONS_TEXTS;
  protected readonly icons = NOTIFICATIONS_ICONS;
  protected readonly tabs = NOTIFICATIONS_TABS;
  protected readonly skeletonRows = NOTIFICATIONS_SKELETON_ROWS;

  protected readonly isOpen = signal(false);
  protected readonly activeTab = signal<NotificationTab>('all');
  /** Reference time for "5 хв тому"; refreshed when the panel opens or a live event arrives. */
  private readonly now = signal(Date.now());

  private readonly userId = computed(() => this.authService.getUserId());

  /** Same key as the home page, so the admin (and their shops) is fetched once. */
  private readonly adminQuery = injectQuery(() => {
    const userId = this.userId();
    return {
      queryKey: userId ? ADMINS_QUERY_KEYS.byId(userId) : ADMINS_QUERY_KEYS.disabled,
      enabled: Boolean(userId),
      queryFn: () => lastValueFrom(this.adminsService.getAdminById(userId ?? '')),
    };
  });

  private readonly shops = computed(() => {
    const admin = this.adminQuery.data();
    return admin ? extractAdminShops(admin) : [];
  });
  private readonly shopIds = computed(() => this.shops().map((shop) => shop.id), {
    equal: areStringListsEqual,
  });
  private readonly shopNames = computed(
    () => new Map(this.shops().map((shop) => [shop.id, shop.name])),
  );
  private readonly unreadOnly = computed(() => this.activeTab() === 'unread');

  private readonly unreadCountQueries = injectQueries(() => ({
    queries: this.shopIds().map((shopId) => ({
      queryKey: NOTIFICATIONS_QUERY_KEYS.unreadCount(shopId),
      queryFn: () => lastValueFrom(this.notificationsService.getUnreadCount(shopId)),
    })),
  }));

  /** Lists load only while the panel is open; the bell needs just the counts. */
  private readonly listQueries = injectQueries(() => ({
    queries: this.shopIds().map((shopId) => ({
      queryKey: NOTIFICATIONS_QUERY_KEYS.list(shopId, this.unreadOnly()),
      enabled: this.isOpen(),
      queryFn: () =>
        lastValueFrom(
          this.notificationsService.getNotifications({
            shopId,
            page: NOTIFICATIONS_FIRST_PAGE,
            limit: NOTIFICATIONS_PAGE_SIZE,
            unreadOnly: this.unreadOnly(),
          }),
        ),
    })),
  }));

  private readonly unreadCounts = computed(() =>
    this.unreadCountQueries().map((result) => result.data()?.count ?? 0),
  );
  protected readonly unreadCount = computed(() =>
    this.unreadCounts().reduce((total, count) => total + count, 0),
  );
  protected readonly unreadCountLabel = computed(() => String(this.unreadCount()));
  protected readonly hasUnread = computed(() => this.unreadCount() > 0);
  protected readonly bellLabel = computed(() =>
    this.hasUnread()
      ? `${NOTIFICATIONS_TEXTS.BELL_LABEL}, ${this.unreadCount()} ${NOTIFICATIONS_TEXTS.BELL_UNREAD_LABEL_SUFFIX}`
      : NOTIFICATIONS_TEXTS.BELL_LABEL,
  );
  protected readonly unreadBadgeLabel = computed(
    () => `${this.unreadCount()} ${NOTIFICATIONS_TEXTS.UNREAD_BADGE_SUFFIX}`,
  );

  protected readonly groups = computed(() => {
    const now = this.now();
    const shopNames = this.shopNames();
    const items = this.listQueries()
      .flatMap((result) => result.data()?.items ?? [])
      .map((item) => mapNotification(item, shopNames.get(item.shopId) ?? '', now));

    return groupNotifications(filterNotifications(items, this.activeTab()));
  });

  protected readonly isLoading = computed(() =>
    this.listQueries().some((result) => result.isLoading()),
  );
  protected readonly isError = computed(
    () => !this.isLoading() && this.listQueries().some((result) => result.isError()),
  );
  protected readonly isEmpty = computed(
    () => !this.isLoading() && !this.isError() && this.groups().length === 0,
  );

  private readonly markReadMutation = injectMutation(() => ({
    mutationFn: (variables: NotificationMarkReadVariables) =>
      lastValueFrom(this.notificationsService.markAsRead(variables.id)),
    onSuccess: (_: void, variables: NotificationMarkReadVariables) =>
      this.applyMarkedRead(variables),
  }));

  protected readonly readAllMutation = injectMutation(() => ({
    mutationFn: (shopIds: string[]) =>
      Promise.all(
        shopIds.map((shopId) => lastValueFrom(this.notificationsService.markAllAsRead(shopId))),
      ),
    onSuccess: () =>
      this.queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.scope }),
  }));

  constructor() {
    toObservable(this.shopIds)
      .pipe(
        switchMap((shopIds) => merge(...shopIds.map((id) => this.streamService.connect(id)))),
        takeUntilDestroyed(),
      )
      .subscribe((notification) => this.onLiveNotification(notification));
  }

  protected toggle(): void {
    if (!this.isOpen()) {
      this.now.set(Date.now());
    }

    this.isOpen.update((open) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  /** `composedPath` still holds rows that a click removed from the DOM (e.g. on the unread tab). */
  protected onDocumentClick(event: Event): void {
    if (!event.composedPath().includes(this.host.nativeElement)) {
      this.close();
    }
  }

  protected selectTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  protected openItem(item: NotificationItemData): void {
    this.markRead(item);

    if (item.link) {
      this.close();
      void this.router.navigateByUrl(item.link);
    }
  }

  protected markRead(item: NotificationItemData): void {
    if (!item.isRead) {
      this.markReadMutation.mutate({ id: item.id, shopId: item.shopId });
    }
  }

  protected readAll(): void {
    const counts = this.unreadCounts();
    const shopIds = this.shopIds().filter((_, index) => counts[index] > 0);

    if (shopIds.length) {
      this.readAllMutation.mutate(shopIds);
    }
  }

  private applyMarkedRead({ id, shopId }: NotificationMarkReadVariables): void {
    for (const unreadOnly of [false, true]) {
      this.queryClient.setQueryData<NotificationsListResponse>(
        NOTIFICATIONS_QUERY_KEYS.list(shopId, unreadOnly),
        (response) => markNotificationReadInList(response, id, unreadOnly),
      );
    }

    void this.queryClient.invalidateQueries({
      queryKey: NOTIFICATIONS_QUERY_KEYS.shopScope(shopId),
    });
  }

  private onLiveNotification(notification: NotificationApiItem): void {
    this.now.set(Date.now());
    void this.queryClient.invalidateQueries({
      queryKey: NOTIFICATIONS_QUERY_KEYS.shopScope(notification.shopId),
    });

    if (notification.type === NOTIFICATION_TYPES.ORDER_CREATED) {
      void this.queryClient.invalidateQueries({
        queryKey: SHOP_QUERY_KEYS.ordersScope(notification.shopId),
      });
    }
  }
}
