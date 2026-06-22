import { MenuItem } from '../models/menu.model';

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/admin' },
  { icon: 'inventory_2', label: 'Inventory', route: '/admin/inventory' },
  { icon: 'shopping_cart', label: 'Orders', route: '/admin/orders' },
  { icon: 'leaderboard', label: 'Analytics', route: '/admin/analytics' },
  { icon: 'settings', label: 'Settings', route: '/admin/settings' },
];
