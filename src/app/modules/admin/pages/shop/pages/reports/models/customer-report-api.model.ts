import { FinanceInsightApi, ReportApiPeriod } from './report-api-common.model';

export type CustomerSummaryApi = {
  totalCustomers?: number | null;
  repeatCustomers?: number | null;
  /** 0..1 */
  repeatRate?: number | null;
  guestCustomers?: number | null;
  averageLtv?: number | null;
  averageOrdersPerCustomer?: number | null;
  activeCustomers?: number | null;
  newCustomers?: number | null;
  returningCustomers?: number | null;
  periodRevenue?: number | null;
  returningRevenue?: number | null;
  /** 0..1 */
  returningRevenueShare?: number | null;
};

export type CustomerSegmentSummaryApi = {
  segment?: string | null;
  customersCount?: number | null;
  revenue?: number | null;
  /** 0..1 */
  customersShare?: number | null;
};

export type CustomerReportApi = {
  period?: ReportApiPeriod | null;
  summary?: CustomerSummaryApi | null;
  segments?: CustomerSegmentSummaryApi[] | null;
  insights?: FinanceInsightApi[] | null;
};
