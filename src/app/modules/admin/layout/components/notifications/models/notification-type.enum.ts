/** Notification types the API emits (`NotificationType` on the backend). */
export const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order_created',
  CUSTOMER_REGISTERED: 'customer_registered',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
