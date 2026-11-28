import { FinanceInsightApi, ReportApiPeriod } from './report-api-common.model';

export type AbcClassSummaryApi = {
  abcClass?: string | null;
  productsCount?: number | null;
  revenue?: number | null;
  /** 0..1 */
  revenueShare?: number | null;
};

export type AbcProductApi = {
  productId?: string | null;
  name?: string | null;
  slug?: string | null;
  revenue?: number | null;
  unitsSold?: number | null;
  ordersCount?: number | null;
  abcClass?: string | null;
  /** 0..1 */
  revenueShare?: number | null;
  /** 0..1 */
  cumulativeShare?: number | null;
};

export type ProductTrendApi = {
  productId?: string | null;
  name?: string | null;
  slug?: string | null;
  revenue?: number | null;
  previousRevenue?: number | null;
  revenueChange?: number | null;
  /** `null` for products with no sales in the previous period. */
  revenueChangePercent?: number | null;
};

export type DeadStockProductApi = {
  productId?: string | null;
  name?: string | null;
  slug?: string | null;
  price?: number | null;
  /** ISO date-time; `null` when the product was never sold. */
  lastSoldAt?: string | null;
};

export type DeadStockApi = {
  days?: number | null;
  total?: number | null;
  items?: DeadStockProductApi[] | null;
};

export type ProductReportApi = {
  period?: ReportApiPeriod | null;
  previousPeriod?: ReportApiPeriod | null;
  totalRevenue?: number | null;
  productsSold?: number | null;
  abcSummary?: AbcClassSummaryApi[] | null;
  topProducts?: AbcProductApi[] | null;
  growing?: ProductTrendApi[] | null;
  declining?: ProductTrendApi[] | null;
  deadStock?: DeadStockApi | null;
  insights?: FinanceInsightApi[] | null;
};
