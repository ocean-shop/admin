import { ShopStatistic } from '../../shop/models/shop-statistic.model';

/** Statistic of each admin shop by position; `undefined` while it is loading or failed. */
export type HomeShopStatistics = (ShopStatistic | undefined)[];
