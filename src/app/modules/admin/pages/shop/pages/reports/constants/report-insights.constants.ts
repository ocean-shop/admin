import { InsightTone } from '@ui/insight-list/models/insight-tone.type';
import { InsightSeverity } from '../models/insight-severity.type';
import { InsightMeta } from '../models/insight-meta.model';

export const REPORT_INSIGHT_SEVERITY_META: Record<InsightSeverity, InsightMeta> = {
  positive: { icon: 'trending_up', tone: 'positive' },
  warning: { icon: 'warning', tone: 'warning' },
  info: { icon: 'info', tone: 'info' },
};

export const REPORT_INSIGHT_DEFAULT_SEVERITY: InsightSeverity = 'info';

/** Icons by the stable insight `code` from the API; unknown codes use the severity icon. */
export const REPORT_INSIGHT_CODE_ICONS: Record<string, string> = {
  net_sales_growth: 'trending_up',
  net_sales_decline: 'trending_down',
  discounts_outpace_sales: 'sell',
  high_cancellation_rate: 'block',
  high_cod_in_transit: 'local_shipping',
  aov_decline: 'shopping_cart',
  top_product_dependency: 'star',
  dead_stock: 'hourglass_empty',
  low_repeat_rate: 'group',
  at_risk_customers: 'person_alert',
};

/** Codes that deserve a stronger colour than their severity. */
export const REPORT_INSIGHT_CODE_TONES: Record<string, InsightTone> = {
  high_cancellation_rate: 'danger',
  dead_stock: 'danger',
};
