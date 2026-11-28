import { FinanceInsightApi, ReportApiPeriod } from './report-api-common.model';

export type RevenueSummaryApi = {
  ordersCount?: number | null;
  grossSales?: number | null;
  discounts?: number | null;
  netSales?: number | null;
  paidRevenue?: number | null;
  outstanding?: number | null;
  /** Cash on delivery parcels already shipped but not paid. */
  codInTransit?: number | null;
  averageOrderValue?: number | null;
  cancelledCount?: number | null;
  cancelledAmount?: number | null;
  /** 0..1 */
  cancellationRate?: number | null;
};

/** Percent change vs the previous period; `null` when the previous value is 0. */
export type RevenueChangesApi = {
  [K in keyof RevenueSummaryApi]?: number | null;
};

export type RevenueBreakdownApiItem = {
  key?: string | null;
  ordersCount?: number | null;
  netSales?: number | null;
  /** 0..1 */
  share?: number | null;
};

export type RevenueTimelineApiPoint = {
  /** Bucket start, `YYYY-MM-DD`. */
  period?: string | null;
  ordersCount?: number | null;
  netSales?: number | null;
  paidRevenue?: number | null;
};

export type RevenueReportApi = {
  period?: ReportApiPeriod | null;
  previousPeriod?: ReportApiPeriod | null;
  granularity?: string | null;
  summary?: RevenueSummaryApi | null;
  previousSummary?: RevenueSummaryApi | null;
  changes?: RevenueChangesApi | null;
  byPaymentMethod?: RevenueBreakdownApiItem[] | null;
  byShippingMethod?: RevenueBreakdownApiItem[] | null;
  timeline?: RevenueTimelineApiPoint[] | null;
  insights?: FinanceInsightApi[] | null;
};
