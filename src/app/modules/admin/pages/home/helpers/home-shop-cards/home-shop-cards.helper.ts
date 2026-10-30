import {
  ShopOverviewCardData,
  ShopOverviewMetric,
} from '@ui/shop-overview-card/models/shop-overview-card.model';
import { extractAdminShops } from '../../../admins/helpers/admin-mapping/admin-mapping.helper';
import { AdminApiItem } from '../../../admins/models/admin.model';
import { AdminShop } from '../../../admins/models/admin-shop.model';
import { MonthlyStatistic, ShopStatistic } from '../../../shop/models/shop-statistic.model';
import {
  HOME_METRIC_PENDING_ICON,
  HOME_PRODUCTS_METRIC_ICON,
  HOME_SALES_METRIC_ICON,
  HOME_TEXTS,
} from '../../constants/home.constants';
import { HomeShopStatistics } from '../../models/home-shop-statistics.type';

/** The statistic endpoint returns monthly counts over the whole shop history, so their sum is the total. */
export const sumMonthlyStatistic = (entries: MonthlyStatistic[] | undefined): number =>
  (entries ?? []).reduce((total, entry) => total + (Number(entry.count) || 0), 0);

const buildPendingMetric = (label: string): ShopOverviewMetric => ({
  label,
  value: HOME_TEXTS.METRIC_EMPTY_VALUE,
  helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
  helperIcon: HOME_METRIC_PENDING_ICON,
});

const buildCountMetric = (
  label: string,
  count: number,
  helperText: string,
  helperIcon: string,
): ShopOverviewMetric => ({ label, value: String(count), helperText, helperIcon });

/** Overview card of a shop; metrics stay pending until the shop statistic is loaded. */
export const buildShopOverviewCard = (
  shop: AdminShop,
  statistic?: ShopStatistic,
): ShopOverviewCardData => ({
  shopId: shop.id,
  title: shop.name || `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} ${shop.id}`,
  actionLabel: HOME_TEXTS.MANAGE_SHOP_LABEL,
  metrics: statistic
    ? [
        buildCountMetric(
          HOME_TEXTS.SALES_METRIC_LABEL,
          sumMonthlyStatistic(statistic.orders),
          HOME_TEXTS.SALES_METRIC_HELPER_TEXT,
          HOME_SALES_METRIC_ICON,
        ),
        buildCountMetric(
          HOME_TEXTS.PRODUCTS_METRIC_LABEL,
          sumMonthlyStatistic(statistic.products),
          HOME_TEXTS.PRODUCTS_METRIC_HELPER_TEXT,
          HOME_PRODUCTS_METRIC_ICON,
        ),
      ]
    : [
        buildPendingMetric(HOME_TEXTS.SALES_METRIC_LABEL),
        buildPendingMetric(HOME_TEXTS.PRODUCTS_METRIC_LABEL),
      ],
});

export const resolveAdminShops = (admin: AdminApiItem | undefined): AdminShop[] =>
  admin ? extractAdminShops(admin) : [];

/** Cards of the admin's shops sorted by title; `statistics[i]` belongs to `shops[i]`. */
export const mapAdminShopsToCards = (
  shops: AdminShop[],
  statistics: HomeShopStatistics,
): ShopOverviewCardData[] =>
  shops
    .map((shop, index) => buildShopOverviewCard(shop, statistics[index]))
    .sort((left, right) => left.title.localeCompare(right.title));
