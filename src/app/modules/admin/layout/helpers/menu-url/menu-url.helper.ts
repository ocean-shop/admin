import {
  MENU_SHOP_ID_PLACEHOLDER,
  MENU_SHOP_ID_URL_PATTERN,
  MENU_SHOP_ROOT_ROUTE_PATTERN,
  MENU_URL_HASH_SEPARATOR,
  MENU_URL_QUERY_SEPARATOR,
} from '../../constants/menu.constants';
import { MenuItem } from '../../models/menu.model';

/** Router URL without query string and fragment. */
export const stripUrlQueryAndHash = (url: string): string =>
  url.split(MENU_URL_QUERY_SEPARATOR)[0].split(MENU_URL_HASH_SEPARATOR)[0];

export const extractShopIdFromUrl = (url: string): string | null => {
  const match = MENU_SHOP_ID_URL_PATTERN.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
};

export const isShopRootRoute = (route: string): boolean => MENU_SHOP_ROOT_ROUTE_PATTERN.test(route);

/** Fills the shop id into the shop menu routes; items stay untouched outside a shop. */
export const resolveShopMenuItems = (items: MenuItem[], shopId: string | null): MenuItem[] =>
  shopId
    ? items.map((item) => ({
        ...item,
        route: item.route.replace(MENU_SHOP_ID_PLACEHOLDER, shopId),
      }))
    : items;
