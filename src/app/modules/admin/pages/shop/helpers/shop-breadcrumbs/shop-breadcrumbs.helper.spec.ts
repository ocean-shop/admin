import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { SHOP_BREADCRUMB_LABEL, SHOPS_ROUTE } from '../../constants/shop-breadcrumbs.constants';
import {
  buildShopBreadcrumb,
  buildShopPageBreadcrumbs,
  buildShopSectionBreadcrumb,
  buildShopSectionPageBreadcrumbs,
} from './shop-breadcrumbs.helper';

describe('shop-breadcrumbs.helper', () => {
  describe('buildShopBreadcrumb', () => {
    it('links to the shop page', () => {
      expect(buildShopBreadcrumb(' shop-1 ')).toEqual({
        label: SHOP_BREADCRUMB_LABEL,
        href: '/admin/shop/shop-1',
      });
    });

    it('falls back to the shops list without a shop id', () => {
      expect(buildShopBreadcrumb(null).href).toBe(SHOPS_ROUTE);
      expect(buildShopBreadcrumb('  ').href).toBe(SHOPS_ROUTE);
    });
  });

  describe('buildShopSectionBreadcrumb', () => {
    it('links to the section inside the shop', () => {
      expect(buildShopSectionBreadcrumb('shop-1', 'orders', 'Orders')).toEqual({
        label: 'Orders',
        href: '/admin/shop/shop-1/orders',
      });
    });

    it('renders a plain label without a shop id', () => {
      expect(buildShopSectionBreadcrumb(null, 'orders', 'Orders')).toEqual({ label: 'Orders' });
    });
  });

  it('buildShopSectionPageBreadcrumbs adds the section between shop and page', () => {
    expect(buildShopSectionPageBreadcrumbs('shop-1', 'orders', 'Orders', 'Details')).toEqual([
      DASHBOARD_BREADCRUMB,
      buildShopBreadcrumb('shop-1'),
      { label: 'Orders', href: '/admin/shop/shop-1/orders' },
      { label: 'Details' },
    ]);
  });

  it('buildShopPageBreadcrumbs builds the full trail', () => {
    expect(buildShopPageBreadcrumbs('shop-1', 'Tags')).toEqual([
      DASHBOARD_BREADCRUMB,
      buildShopBreadcrumb('shop-1'),
      { label: 'Tags' },
    ]);
  });
});
