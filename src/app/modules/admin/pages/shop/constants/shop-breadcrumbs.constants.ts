import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';

const SHOPS_ROUTE = '/admin/shops';
const SHOP_ROUTE_PREFIX = '/admin/shop';

export const SHOP_BREADCRUMB_LABEL = 'Shop';

export function buildShopBreadcrumb(shopId: string | null): BreadcrumbItem {
  const normalizedShopId = shopId?.trim();
  if (!normalizedShopId) {
    return {
      label: SHOP_BREADCRUMB_LABEL,
      href: SHOPS_ROUTE,
    };
  }

  return {
    label: SHOP_BREADCRUMB_LABEL,
    href: `${SHOP_ROUTE_PREFIX}/${normalizedShopId}`,
  };
}

export function buildShopSectionBreadcrumb(
  shopId: string | null,
  sectionPath: string,
  label: string,
): BreadcrumbItem {
  const normalizedShopId = shopId?.trim();
  if (!normalizedShopId) {
    return { label };
  }

  return {
    label,
    href: `${SHOP_ROUTE_PREFIX}/${normalizedShopId}/${sectionPath}`,
  };
}
