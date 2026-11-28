import { ReportGranularity } from './report-granularity.type';
import { ReportPeriod } from './report-period.model';

export type ReportQuery = ReportPeriod & {
  shopId: string;
};

export type RevenueReportQuery = ReportQuery & {
  /** Omitted to let the API pick the step. */
  groupBy?: ReportGranularity;
};

export type ProductReportQuery = ReportQuery & {
  limit: number;
  deadStockDays: number;
};
