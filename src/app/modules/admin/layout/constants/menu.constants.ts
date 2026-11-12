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
  { icon: 'storefront', label: 'Огляд магазину', route: '/admin/shop/:shopId' },
  { icon: 'account_tree', label: 'Категорії', route: '/admin/shop/:shopId/categories' },
  { icon: 'tune', label: 'Атрибути', route: '/admin/shop/:shopId/attributes' },
  { icon: 'sell', label: 'Теги', route: '/admin/shop/:shopId/tags' },
  { icon: 'inventory_2', label: 'Продукти', route: '/admin/shop/:shopId/products' },
  { icon: 'receipt_long', label: 'Замовлення', route: '/admin/shop/:shopId/orders' },
  { icon: 'group', label: 'Користувачі', route: '/admin/shop/:shopId/users' },
];

export const ADMIN_MENU_GENERAL_ITEMS: MenuItem[] = [
  { icon: 'dashboard', label: 'Головна', route: ADMIN_HOME_ROUTE },
  { icon: 'store', label: 'Магазини', route: ADMIN_SHOPS_ROUTE },
  { icon: 'admin_panel_settings', label: 'Адміністратори', route: ADMIN_ADMINS_ROUTE },
];

export const ADMIN_MENU_LOGOUT_ITEM: MenuFooterItem = {
  icon: 'logout',
  label: 'Вийти',
  value: MENU_LOGOUT_ACTION,
  buttonClass: 'footer-btn-danger',
};

export const MENU_TEXTS = {
  NAV_LABEL: 'Головне меню',
  WORKSPACE_TITLE: 'Ocean Breeze',
  WORKSPACE_SUBTITLE: 'Адмін-панель',
  SHOP_GROUP: 'Магазин',
  GENERAL_GROUP: 'Загальне',
} as const;

export const MENU_WORKSPACE_ICON = 'waves';
