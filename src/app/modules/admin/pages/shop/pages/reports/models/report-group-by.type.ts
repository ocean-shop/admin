import { ReportGranularity } from './report-granularity.type';

/** `auto` lets the API pick the timeline step from the period length. */
export type ReportGroupBy = ReportGranularity | 'auto';
