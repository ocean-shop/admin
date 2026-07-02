import { MenuFooterItem, MenuItem } from '../models/menu.model';

export const ADMIN_HOME_ROUTE = '/admin';
export const ADMIN_SETTINGS_ROUTE = '/admin/settings';

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: 'dashboard', label: 'Головна', route: '/admin' },
  { icon: 'leaderboard', label: 'Каталог', route: '/admin/products' },
  { icon: 'settings', label: 'Налаштування', route: '/admin/settings' },
];

export const ADMIN_MENU_FOOTER_ITEMS: MenuFooterItem[] = [
  { icon: 'dashboard', label: 'Головна', route: '/admin', buttonClass: 'footer-btn' },
  { icon: 'ShoppingBag', label: 'Магазини', route: '/admin/shops', buttonClass: 'footer-btn' },
  { icon: 'person', label: 'Адміністратори', route: '/admin/admins', buttonClass: 'footer-btn' },
  { icon: 'logout', label: 'Вийти', value: 'logout', buttonClass: 'footer-btn-danger' },
];
