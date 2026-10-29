import { MENU_SHOP_ID_PLACEHOLDER } from '../constants/menu.constants';
import {
  extractShopIdFromUrl,
  isShopRootRoute,
  resolveShopMenuItems,
  stripUrlQueryAndHash,
} from './menu-url.helper';

describe('menu-url.helper', () => {
  it('stripUrlQueryAndHash drops the query string and fragment', () => {
    expect(stripUrlQueryAndHash('/admin/shop/1?tab=2#top')).toBe('/admin/shop/1');
    expect(stripUrlQueryAndHash('/admin#top')).toBe('/admin');
    expect(stripUrlQueryAndHash('/admin')).toBe('/admin');
  });

  it('extractShopIdFromUrl reads and decodes the shop id', () => {
    expect(extractShopIdFromUrl('/admin/shop/shop%201/tags')).toBe('shop 1');
    expect(extractShopIdFromUrl('/admin/shops')).toBeNull();
  });

  it('isShopRootRoute matches only the shop dashboard', () => {
    expect(isShopRootRoute('/admin/shop/1')).toBe(true);
    expect(isShopRootRoute('/admin/shop/1/tags')).toBe(false);
  });

  it('resolveShopMenuItems fills the shop id into routes', () => {
    const items = [
      { icon: 'tags', label: 'Tags', route: `/admin/shop/${MENU_SHOP_ID_PLACEHOLDER}/tags` },
    ];

    expect(resolveShopMenuItems(items, 'shop-1')[0].route).toBe('/admin/shop/shop-1/tags');
    expect(resolveShopMenuItems(items, null)).toBe(items);
  });
});
