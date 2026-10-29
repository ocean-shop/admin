import { ShopOverviewCardData } from '@ui/shop-overview-card/models/shop-overview-card.model';
import { extractAdminShops } from '../../admins/helpers/admin-mapping.helper';
import { AdminApiItem } from '../../admins/models/admin.model';
import { AdminShop } from '../../admins/models/admin-shop.model';
import { HOME_METRIC_PENDING_ICON, HOME_TEXTS } from '../constants/home.constants';

/** Overview card of a shop; metrics are placeholders until the API provides them. */
export const buildShopOverviewCard = (shop: AdminShop): ShopOverviewCardData => ({
  shopId: shop.id,
  title: shop.name || `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} ${shop.id}`,
  actionLabel: HOME_TEXTS.MANAGE_SHOP_LABEL,
  metrics: [
    {
      label: HOME_TEXTS.SALES_METRIC_LABEL,
      value: HOME_TEXTS.METRIC_EMPTY_VALUE,
      helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
      helperIcon: HOME_METRIC_PENDING_ICON,
    },
    {
      label: HOME_TEXTS.STOCK_METRIC_LABEL,
      value: HOME_TEXTS.METRIC_EMPTY_VALUE,
      helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
    },
  ],
});

/** Cards of the admin's shops, sorted by title. */
export const mapAdminShopsToCards = (admin: AdminApiItem | undefined): ShopOverviewCardData[] =>
  (admin ? extractAdminShops(admin) : [])
    .map(buildShopOverviewCard)
    .sort((left, right) => left.title.localeCompare(right.title));
