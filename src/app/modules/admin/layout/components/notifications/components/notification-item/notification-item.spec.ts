import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NOTIFICATIONS_TEXTS } from '../../constants/notifications.constants';
import { NotificationItem as NotificationItemData } from '../../models/notification-item.model';
import { NotificationItem } from './notification-item';

const ITEM: NotificationItemData = {
  id: 'n1',
  shopId: 's1',
  isOrder: true,
  isRead: false,
  isToday: true,
  createdAt: 1,
  icon: 'receipt_long',
  tone: 'primary',
  title: 'Нове замовлення №5',
  text: 'Олена Коваль · 10 ₴',
  meta: '2 хв тому · Shop 1',
  link: '/admin/shop/s1/orders/o1',
  actionLabel: NOTIFICATIONS_TEXTS.OPEN_ORDER,
};

describe('NotificationItem', () => {
  let fixture: ComponentFixture<NotificationItem>;
  let element: HTMLElement;

  const render = async (item: NotificationItemData): Promise<void> => {
    fixture.componentRef.setInput('item', item);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationItem],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationItem);
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders an unread item with texts, dot and actions', async () => {
    await render(ITEM);

    expect(element.querySelector('.notification-title')?.textContent?.trim()).toBe(ITEM.title);
    expect(element.querySelector('.notification-text')?.textContent).toContain(ITEM.text);
    expect(element.querySelector('.notification-meta')?.textContent).toContain(ITEM.meta);
    expect(element.querySelector('.notification-unread')).toBeTruthy();
    expect(element.querySelector('.notification-icon-primary')).toBeTruthy();
    expect(element.querySelector('.notification-dot')).toBeTruthy();
    expect(element.textContent).toContain(NOTIFICATIONS_TEXTS.UNREAD_DOT_LABEL);
    expect(element.querySelectorAll('app-button')).toHaveLength(2);
  });

  it('hides dot, actions and empty text for a read item without a link', async () => {
    await render({ ...ITEM, isRead: true, text: '', actionLabel: null, link: null, tone: 'info' });

    expect(element.querySelector('.notification-unread')).toBeNull();
    expect(element.querySelector('.notification-dot')).toBeNull();
    expect(element.querySelector('.notification-text')).toBeNull();
    expect(element.querySelector('app-button')).toBeNull();
    expect(element.querySelector('.notification-icon-info')).toBeTruthy();
  });

  it('emits opened from the title and the primary action', async () => {
    await render(ITEM);
    const opened = vi.fn();
    fixture.componentInstance.opened.subscribe(opened);

    (element.querySelector('.notification-title') as HTMLButtonElement).click();
    (element.querySelectorAll('app-button button')[0] as HTMLButtonElement).click();

    expect(opened).toHaveBeenCalledTimes(2);
    expect(opened).toHaveBeenCalledWith(ITEM);
  });

  it('emits markedRead from the secondary action', async () => {
    await render(ITEM);
    const markedRead = vi.fn();
    fixture.componentInstance.markedRead.subscribe(markedRead);

    (element.querySelectorAll('app-button button')[1] as HTMLButtonElement).click();

    expect(markedRead).toHaveBeenCalledWith(ITEM);
  });
});
