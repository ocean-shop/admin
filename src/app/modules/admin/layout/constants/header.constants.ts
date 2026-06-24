import { SimpleMenuEntry } from '@ui/simple-menu/models/simple-menu.type';

export const ACCOUNT_MENU_ITEMS: SimpleMenuEntry[] = [
  { label: 'Settings', icon: 'settings', value: 'account', link: '/admin/settings' },
  { type: 'divider' },
  { label: 'Logout', icon: 'logout', value: 'logout', variant: 'danger' },
];
