import { PaginatedResponse } from '@core/models/paginated-response.model';

export type OrderCreatedPayloadApi = {
  orderId?: string | null;
  orderNumber?: string | number | null;
  totalAmount?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type CustomerRegisteredPayloadApi = {
  userId?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
};

export type NotificationPayloadApi = OrderCreatedPayloadApi & CustomerRegisteredPayloadApi;

/** A notification as `GET /notifications` and the live stream return it. */
export type NotificationApiItem = {
  id: string;
  shopId: string;
  type?: string | null;
  payload?: NotificationPayloadApi | null;
  createdAt?: string | null;
  isRead?: boolean | null;
  readAt?: string | null;
};

export type NotificationsListResponse = PaginatedResponse<NotificationApiItem>;

export type UnreadCountResponse = {
  count?: number | null;
};

export type NotificationsListQuery = {
  shopId: string;
  page: number;
  limit: number;
  unreadOnly: boolean;
};
