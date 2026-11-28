import { InsightListItem } from '@ui/insight-list/models/insight-list-item.model';
import { ShareBarSegment } from '@ui/share-bar/models/share-bar-segment.model';
import { CustomerSegment } from './customer-segment.type';
import { CustomerSegmentTone } from './customer-segment-tone.type';
import { ReportKpi } from './report-kpi.model';

export type CustomerSplitMetric = {
  id: string;
  label: string;
  value: string;
  caption: string;
};

export type CustomerSplitView = {
  description: string;
  segments: ShareBarSegment[];
  ariaLabel: string;
  metrics: CustomerSplitMetric[];
};

export type CustomerSegmentView = {
  segment: CustomerSegment;
  title: string;
  icon: string;
  tone: CustomerSegmentTone;
  description: string;
  countLabel: string;
  detailsLabel: string;
};

export type CustomerReportView = {
  insights: InsightListItem[];
  kpis: ReportKpi[];
  split: CustomerSplitView;
  segmentsDescription: string;
  segments: CustomerSegmentView[];
};
