import { ChangeBadgeData } from '@ui/change-badge/models/change-badge-data.model';
import { InsightListItem } from '@ui/insight-list/models/insight-list-item.model';
import { ShareBarSegment } from '@ui/share-bar/models/share-bar-segment.model';
import { ReportGranularity } from './report-granularity.type';
import { ReportKpi } from './report-kpi.model';
import { RevenueHighlightTone } from './revenue-highlight-tone.type';

/** Callout card under the KPIs: money on the road, cancellation losses. */
export type RevenueHighlight = {
  id: string;
  icon: string;
  tone: RevenueHighlightTone;
  title: string;
  value: string;
  description: string;
  change: ChangeBadgeData | null;
  previous: string;
  linkLabel: string;
};

export type RevenueBreakdownRow = {
  key: string;
  name: string;
  amount: string;
  /** «60% · 98 замовлень» */
  metaLabel: string;
  bar: ShareBarSegment[];
};

export type RevenueBreakdown = {
  id: string;
  title: string;
  icon: string;
  rows: RevenueBreakdownRow[];
};

export type RevenueChartData = {
  categories: string[];
  netSales: number[];
  paidRevenue: number[];
};

export type RevenueReportView = {
  granularity: ReportGranularity;
  /** «01.11 – 27.11.2026» */
  currentRangeLabel: string;
  previousRangeLabel: string;
  /** «Разом 219 600 ₴ за 171 замовлення» */
  totalLabel: string;
  kpis: ReportKpi[];
  highlights: RevenueHighlight[];
  chart: RevenueChartData;
  breakdowns: RevenueBreakdown[];
  insights: InsightListItem[];
};
