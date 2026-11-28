import { ReportPeriod } from './report-period.model';
import { ReportPeriodPreset } from './report-period-preset.type';

export type ReportPeriodSelection = {
  period: ReportPeriod;
  /** `null` when dates were picked by hand. */
  preset: ReportPeriodPreset | null;
};
