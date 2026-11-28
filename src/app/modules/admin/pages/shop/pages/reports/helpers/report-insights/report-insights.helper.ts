import { InsightListItem } from '@ui/insight-list/models/insight-list-item.model';
import {
  REPORT_INSIGHT_CODE_ICONS,
  REPORT_INSIGHT_CODE_TONES,
  REPORT_INSIGHT_DEFAULT_SEVERITY,
  REPORT_INSIGHT_SEVERITY_META,
} from '../../constants/report-insights.constants';
import { FinanceInsightApi } from '../../models/report-api-common.model';
import { InsightSeverity } from '../../models/insight-severity.type';

const isInsightSeverity = (value: string | null | undefined): value is InsightSeverity =>
  Boolean(value && value in REPORT_INSIGHT_SEVERITY_META);

const mapInsight = (insight: FinanceInsightApi, index: number): InsightListItem => {
  const code = insight.code?.trim() ?? '';
  const severity = isInsightSeverity(insight.severity)
    ? insight.severity
    : REPORT_INSIGHT_DEFAULT_SEVERITY;
  const meta = REPORT_INSIGHT_SEVERITY_META[severity];

  return {
    id: code ? `${code}-${index}` : String(index),
    icon: REPORT_INSIGHT_CODE_ICONS[code] ?? meta.icon,
    tone: REPORT_INSIGHT_CODE_TONES[code] ?? meta.tone,
    message: insight.message?.trim() ?? '',
  };
};

/** Rule-based insights from the API; ones without text are dropped. */
export const mapReportInsights = (
  insights: FinanceInsightApi[] | null | undefined,
): InsightListItem[] => (insights ?? []).map(mapInsight).filter((insight) => insight.message);
