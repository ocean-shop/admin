import { APP_ROUTES } from '@core/constants/routes.constants';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { SHOP_BREADCRUMB_LABEL, SHOPS_ROUTE } from '../../constants/shop-breadcrumbs.constants';

export const buildShopBreadcrumb = (shopId: string | null): BreadcrumbItem => {
  const normalizedShopId = shopId?.trim();

  return {
    label: SHOP_BREADCRUMB_LABEL,
    href: normalizedShopId ? `${APP_ROUTES.ADMIN_SHOP}/${normalizedShopId}` : SHOPS_ROUTE,
  };
};

export const buildShopSectionBreadcrumb = (
  shopId: string | null,
  sectionPath: string,
  label: string,
): BreadcrumbItem => {
  const normalizedShopId = shopId?.trim();
  if (!normalizedShopId) {
    return { label };
  }

  return {
    label,
    href: `${APP_ROUTES.ADMIN_SHOP}/${normalizedShopId}/${sectionPath}`,
  };
};

/** Dashboard → shop → current page trail used by every shop sub-page. */
export const buildShopPageBreadcrumbs = (
  shopId: string | null,
  pageLabel: string,
): BreadcrumbItem[] => [DASHBOARD_BREADCRUMB, buildShopBreadcrumb(shopId), { label: pageLabel }];

/** Dashboard → shop → section → current page trail for pages nested in a section. */
export const buildShopSectionPageBreadcrumbs = (
  shopId: string | null,
  sectionPath: string,
  sectionLabel: string,
  pageLabel: string,
): BreadcrumbItem[] => [
  DASHBOARD_BREADCRUMB,
  buildShopBreadcrumb(shopId),
  buildShopSectionBreadcrumb(shopId, sectionPath, sectionLabel),
  { label: pageLabel },
];
