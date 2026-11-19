import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '@core/constants/loader.constants';
import { NOTIFICATIONS_API_ENDPOINTS } from '../../constants/notifications.constants';
import {
  NotificationsListQuery,
  NotificationsListResponse,
  UnreadCountResponse,
} from '../../models/notification-api.model';

/** Notifications load in the background (header panel), so they never trigger the global loader. */
@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly http = inject(HttpClient);

  getNotifications(query: NotificationsListQuery): Observable<NotificationsListResponse> {
    return this.http.get<NotificationsListResponse>(NOTIFICATIONS_API_ENDPOINTS.LIST, {
      withCredentials: true,
      context: this.backgroundContext(),
      params: {
        shopId: query.shopId,
        page: query.page,
        limit: query.limit,
        unreadOnly: query.unreadOnly,
      },
    });
  }

  getUnreadCount(shopId: string): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(NOTIFICATIONS_API_ENDPOINTS.UNREAD_COUNT, {
      withCredentials: true,
      context: this.backgroundContext(),
      params: { shopId },
    });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(
      NOTIFICATIONS_API_ENDPOINTS.read(id),
      {},
      { withCredentials: true, context: this.backgroundContext() },
    );
  }

  markAllAsRead(shopId: string): Observable<void> {
    return this.http.patch<void>(
      NOTIFICATIONS_API_ENDPOINTS.READ_ALL,
      { shopId },
      { withCredentials: true, context: this.backgroundContext() },
    );
  }

  private backgroundContext(): HttpContext {
    return new HttpContext().set(SKIP_GLOBAL_LOADER, true);
  }
}
