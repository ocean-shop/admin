import { NotificationType } from './notification-type.enum';
import { NotificationTone } from './notification-tone.type';

/** Static per-type presentation: icon, tone and the action that opens the source entity. */
export type NotificationView = {
  type: NotificationType;
  icon: string;
  tone: NotificationTone;
  actionLabel: string;
};
