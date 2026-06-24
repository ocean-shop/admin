import { MenuFooterItem, MenuItem } from '../models/menu.model';

export const ADMIN_HOME_ROUTE = '/admin';
export const ADMIN_SETTINGS_ROUTE = '/admin/settings';

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
  { icon: 'leaderboard', label: 'Products', route: '/admin/products' },
  { icon: 'settings', label: 'Settings', route: '/admin/settings' },
];

export const ADMIN_MENU_FOOTER_ITEMS: MenuFooterItem[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/admin', buttonClass: 'footer-btn' },
  { icon: 'ShoppingBag', label: 'Shops', route: '/admin/shops', buttonClass: 'footer-btn' },
  { icon: 'person', label: 'Admins', route: '/admin/admins', buttonClass: 'footer-btn' },
  { icon: 'logout', label: 'Logout', value: 'logout', buttonClass: 'footer-btn-danger' },
];
