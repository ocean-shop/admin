import { SimpleMenuEntry } from '@ui/simple-menu/models/simple-menu.type';

export const ACCOUNT_MENU_ITEMS: SimpleMenuEntry[] = [
  { label: 'Налаштування', icon: 'settings', value: 'account', link: '/admin/settings' },
  { type: 'divider' },
  { label: 'Вийти', icon: 'logout', value: 'logout', variant: 'danger' },
];
