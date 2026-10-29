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

export const MENU_SHOP_ID_PLACEHOLDER = ':shopId';
export const MENU_LOGOUT_ACTION = 'logout';
/** Shop dashboard route (`/admin/shop/:id`) — needs exact matching to stay inactive on sub-pages. */
export const MENU_SHOP_ROOT_ROUTE_PATTERN = /^\/admin\/shop\/[^/]+$/;
export const MENU_SHOP_ID_URL_PATTERN = /\/admin\/shop\/([^/]+)/;
export const MENU_URL_QUERY_SEPARATOR = '?';
export const MENU_URL_HASH_SEPARATOR = '#';

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: 'shop', label: 'Магазин', route: '/admin/shop/:shopId' },
  { icon: 'category', label: 'Категорії', route: '/admin/shop/:shopId/categories' },
  { icon: 'label', label: 'Аттрибути', route: '/admin/shop/:shopId/attributes' },
  { icon: 'tags', label: 'Теги', route: '/admin/shop/:shopId/tags' },
  { icon: 'inventory', label: 'Продукти', route: '/admin/shop/:shopId/products' },
  { icon: 'receipt', label: 'Замовлення', route: '/admin/shop/:shopId/orders' },
  { icon: 'user', label: 'Користувачі', route: '/admin/shop/:shopId/users' },
];

export const ADMIN_MENU_FOOTER_ITEMS: MenuFooterItem[] = [
  { icon: 'dashboard', label: 'Головна', route: ADMIN_HOME_ROUTE, buttonClass: 'footer-btn' },
  { icon: 'ShoppingBag', label: 'Магазини', route: ADMIN_SHOPS_ROUTE, buttonClass: 'footer-btn' },
  { icon: 'person', label: 'Адміністратори', route: ADMIN_ADMINS_ROUTE, buttonClass: 'footer-btn' },
  { icon: 'logout', label: 'Вийти', value: MENU_LOGOUT_ACTION, buttonClass: 'footer-btn-danger' },
];
