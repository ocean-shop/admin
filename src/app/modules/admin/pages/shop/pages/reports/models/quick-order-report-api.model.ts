import { ReportApiPeriod } from './report-api-common.model';

/** Money values are estimates: one unit per request at the product's current price. */
export type QuickOrderSummaryApi = {
  /** All requests created in the period, any status. */
  totalCount?: number | null;
  newCount?: number | null;
  processedCount?: number | null;
  cancelledCount?: number | null;
  /** Not cancelled requests (new + processed). */
  estimatedValue?: number | null;
  estimatedProcessedValue?: number | null;
  estimatedCancelledValue?: number | null;
  /** 0..1 */
  processedRate?: number | null;
  /** 0..1 */
  cancellationRate?: number | null;
};

/** Percent change vs the previous period; `null` when the previous value is 0. */
export type QuickOrderChangesApi = {
  [K in keyof QuickOrderSummaryApi]?: number | null;
};

export type QuickOrderProductApi = {
  productId?: string | null;
  name?: string | null;
  slug?: string | null;
  currentPrice?: number | null;
  requestsCount?: number | null;
  estimatedValue?: number | null;
};

export type QuickOrderReportApi = {
  period?: ReportApiPeriod | null;
  previousPeriod?: ReportApiPeriod | null;
  valueSource?: string | null;
  summary?: QuickOrderSummaryApi | null;
  previousSummary?: QuickOrderSummaryApi | null;
  changes?: QuickOrderChangesApi | null;
  /** Not cancelled requests grouped by product, most requested first. */
  topProducts?: QuickOrderProductApi[] | null;
};
