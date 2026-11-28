import { ShareBarSegment } from '@ui/share-bar/models/share-bar-segment.model';
import { ReportKpi } from './report-kpi.model';
import { RevenueHighlight } from './revenue-report-view.model';

export type QuickOrderStatusMetric = {
  id: string;
  label: string;
  /** «12 заявок» */
  value: string;
  /** «≈ 8 400 ₴» */
  caption: string;
};

export type QuickOrderStatusSplitView = {
  description: string;
  segments: ShareBarSegment[];
  ariaLabel: string;
  metrics: QuickOrderStatusMetric[];
};

export type QuickOrderProductRow = {
  productId: string;
  rank: number;
  name: string;
  requestsLabel: string;
  shareLabel: string;
  shareBar: ShareBarSegment[];
  price: string;
  estimatedValue: string;
};

export type QuickOrderReportView = {
  previousRangeLabel: string;
  kpis: ReportKpi[];
  highlights: RevenueHighlight[];
  statusSplit: QuickOrderStatusSplitView;
  products: QuickOrderProductRow[];
  /** «Показано 3 товари» */
  productsCaption: string;
};
