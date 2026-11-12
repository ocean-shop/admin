import { SimpleMenuEntry } from '@ui/simple-menu/models/simple-menu.type';

export const HEADER_TEXTS = {
  TITLE: 'Ocean Breeze Admin',
  MENU_TOGGLE_LABEL: 'Згорнути або розгорнути меню',
  NOTIFICATIONS_LABEL: 'Сповіщення',
  ACCOUNT_LABEL: 'Меню акаунта',
} as const;

export const ACCOUNT_MENU_ITEMS: SimpleMenuEntry[] = [
  { label: 'Налаштування', icon: 'settings', value: 'account', link: '/admin/settings' },
  { type: 'divider' },
  { label: 'Вийти', icon: 'logout', value: 'logout', variant: 'danger' },
];

export const HEADER_ICONS = {
  MENU: 'menu',
  NOTIFICATIONS: 'notifications',
  ACCOUNT: 'person',
  EXPAND: 'expand_more',
} as const;
