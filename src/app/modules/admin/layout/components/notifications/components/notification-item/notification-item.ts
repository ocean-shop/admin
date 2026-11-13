import { Component, input, output } from '@angular/core';
import { Button } from '@ui/button/button';
import { NOTIFICATIONS_TEXTS } from '../../constants/notifications.constants';
import { NotificationItem as NotificationItemData } from '../../models/notification-item.model';

/** One row of the notifications panel: icon, texts, unread dot and quick actions. */
@Component({
  selector: 'app-notification-item',
  imports: [Button],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
})
export class NotificationItem {
  public readonly item = input.required<NotificationItemData>();
  public readonly opened = output<NotificationItemData>();
  public readonly markedRead = output<NotificationItemData>();

  protected readonly textData = NOTIFICATIONS_TEXTS;

  protected open(): void {
    this.opened.emit(this.item());
  }

  protected markRead(): void {
    this.markedRead.emit(this.item());
  }
}
