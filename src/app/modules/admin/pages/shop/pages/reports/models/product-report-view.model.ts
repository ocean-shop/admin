import { ChangeBadgeData } from '@ui/change-badge/models/change-badge-data.model';
import { InsightListItem } from '@ui/insight-list/models/insight-list-item.model';
import { ShareBarSegment } from '@ui/share-bar/models/share-bar-segment.model';
import { ShareBarTone } from '@ui/share-bar/models/share-bar-tone.type';
import { AbcClass } from './abc-class.type';
import { ProductTrendKind } from './product-trend-kind.type';

export type AbcClassView = {
  abcClass: AbcClass;
  title: string;
  revenue: string;
  shareLabel: string;
  countLabel: string;
  /** «80% виручки · 3 товари» */
  metaLabel: string;
  productsCount: number;
  tone: ShareBarTone;
};

export type TopProductRow = {
  productId: string;
  rank: number;
  name: string;
  abcClass: AbcClass;
  revenue: string;
  shareLabel: string;
  cumulativeBar: ShareBarSegment[];
  cumulativeLabel: string;
  unitsLabel: string;
  ordersLabel: string;
};

export type ProductTrendRow = {
  productId: string;
  name: string;
  revenue: string;
  change: ChangeBadgeData;
};

export type ProductTrendList = {
  kind: ProductTrendKind;
  title: string;
  icon: string;
  emptyText: string;
  rows: ProductTrendRow[];
};

export type DeadStockRow = {
  productId: string;
  name: string;
  price: string;
  lastSoldLabel: string;
  daysLabel: string;
};

export type DeadStockView = {
  days: number;
  total: number;
  rows: DeadStockRow[];
};

export type ProductReportView = {
  productsSold: number;
  insights: InsightListItem[];
  abcClasses: AbcClassView[];
  abcSegments: ShareBarSegment[];
  abcAriaLabel: string;
  topProducts: TopProductRow[];
  trends: ProductTrendList[];
  deadStock: DeadStockView;
};
