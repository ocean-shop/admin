import { MenuFooterItem, MenuItem } from '../models/menu.model';

export const ADMIN_HOME_ROUTE = '/admin';
export const ADMIN_SETTINGS_ROUTE = '/admin/settings';
export const ADMIN_ADMINS_ROUTE = '/admin/admins';
export const ADMIN_SHOPS_ROUTE = '/admin/shops';
export const ADMIN_PRIMARY_ROUTES = [
  ADMIN_HOME_ROUTE,
  ADMIN_SETTINGS_ROUTE,
  ADMIN_ADMINS_ROUTE,
  ADMIN_SHOPS_ROUTE,
];

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: 'shop', label: 'Магазин', route: '/admin/shop/:shopId' },
  { icon: 'category', label: 'Категорії', route: '/admin/shop/:shopId/categories' },
  { icon: 'tags', label: 'Теги', route: '/admin/shop/:shopId/tags' },
  { icon: 'inventory', label: 'Продукти', route: '/admin/catalog/products' },
  { icon: 'label', label: 'Аттрибути', route: '/admin/catalog/products' },
  { icon: 'receipt', label: 'Замовлення', route: '/admin/orders' },
  { icon: 'settings', label: 'Налаштування', route: '/admin/shop/settings' },
];

export const ADMIN_MENU_FOOTER_ITEMS: MenuFooterItem[] = [
  { icon: 'dashboard', label: 'Головна', route: '/admin', buttonClass: 'footer-btn' },
  { icon: 'ShoppingBag', label: 'Магазини', route: '/admin/shops', buttonClass: 'footer-btn' },
  { icon: 'person', label: 'Адміністратори', route: '/admin/admins', buttonClass: 'footer-btn' },
  { icon: 'logout', label: 'Вийти', value: 'logout', buttonClass: 'footer-btn-danger' },
];
