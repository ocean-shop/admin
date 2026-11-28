import { ChangeBadgeData } from '@ui/change-badge/models/change-badge-data.model';

/** One metric tile of a report. */
export type ReportKpi = {
  id: string;
  label: string;
  value: string;
  hint: string;
  /** `null` when there is nothing to compare with. */
  change: ChangeBadgeData | null;
  /** «було …» caption; empty when the report has no previous period. */
  previous: string;
};
