import { NotificationTone } from './notification-tone.type';

/** A notification ready for the panel: texts resolved, link built, time formatted. */
export type NotificationItem = {
  id: string;
  shopId: string;
  isOrder: boolean;
  isRead: boolean;
  isToday: boolean;
  createdAt: number;
  icon: string;
  tone: NotificationTone;
  title: string;
  text: string;
  meta: string;
  link: string | null;
  actionLabel: string | null;
};
