import { SimpleMenuEntry } from '@ui/simple-menu/models/simple-menu.type';

export const ACCOUNT_MENU_ITEMS: SimpleMenuEntry[] = [
  { label: 'Account', icon: 'person', value: 'account' },
  { type: 'divider' },
  { label: 'Logout', icon: 'logout', value: 'logout', variant: 'danger' },
];
