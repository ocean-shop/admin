import {
  REPORT_DATE_FORMAT,
  REPORT_DATE_PART_LENGTH,
  REPORT_DATE_SEPARATOR,
  REPORT_LOCALE,
  REPORT_ISO_DATE_PATTERN,
  REPORT_MS_IN_DAY,
  REPORT_RANGE_SEPARATOR,
} from '../../constants/report-format.constants';
import {
  REPORT_TAB_VALUES,
  REPORTS_DEFAULT_TAB,
  REPORTS_PRESET_DAYS,
} from '../../constants/reports.constants';
import { ReportApiPeriod } from '../../models/report-api-common.model';
import { ReportPeriod } from '../../models/report-period.model';
import { ReportPeriodPreset } from '../../models/report-period-preset.type';
import { ReportTab } from '../../models/report-tab.type';

const pad = (value: number): string => String(value).padStart(REPORT_DATE_PART_LENGTH, '0');

/** Local calendar date as `YYYY-MM-DD` (not UTC, so late evening stays "today"). */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const shiftDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const rollingPeriod = (today: Date, days: number): ReportPeriod => ({
  from: toIsoDate(shiftDays(today, 1 - days)),
  to: toIsoDate(today),
});

export const buildPresetPeriod = (
  preset: ReportPeriodPreset,
  today: Date = new Date(),
): ReportPeriod => {
  switch (preset) {
    case 'last7Days':
      return rollingPeriod(today, REPORTS_PRESET_DAYS.LAST_7_DAYS);
    case 'last30Days':
      return rollingPeriod(today, REPORTS_PRESET_DAYS.LAST_30_DAYS);
    case 'previousMonth':
      return {
        from: toIsoDate(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
        to: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 0)),
      };
    case 'thisMonth':
    default:
      return {
        from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        to: toIsoDate(today),
      };
  }
};

export const isIsoDate = (value: string | null | undefined): value is string =>
  REPORT_ISO_DATE_PATTERN.test(value ?? '');

/** Both dates set and in order (ISO strings compare chronologically). */
export const isValidReportPeriod = (period: ReportPeriod): boolean =>
  isIsoDate(period.from) && isIsoDate(period.to) && period.from <= period.to;

const splitIsoDate = (value: string): string[] => {
  const match = REPORT_ISO_DATE_PATTERN.exec(value);
  return match ? [match[1], match[2], match[3]] : [];
};

/** `2026-11-01` → `01.11.2026`; non-ISO values are returned as is. */
export const formatReportDate = (value: string): string => {
  const [year, month, day] = splitIsoDate(value);
  return year ? [day, month, year].join(REPORT_DATE_SEPARATOR) : value;
};

/** `2026-11-01` → `01.11`; used for chart axis and short ranges. */
export const formatReportShortDate = (value: string): string => {
  const [year, month, day] = splitIsoDate(value);
  return year ? [day, month].join(REPORT_DATE_SEPARATOR) : value;
};

/** `2026-11-01` → `11.2026`; used for monthly buckets. */
export const formatReportMonth = (value: string): string => {
  const [year, month] = splitIsoDate(value);
  return year ? [month, year].join(REPORT_DATE_SEPARATOR) : value;
};

/** `01.11 – 27.11.2026`; the start keeps its year only when years differ. */
export const formatReportPeriodRange = (period: ReportApiPeriod | null | undefined): string => {
  const from = period?.from ?? '';
  const to = period?.to ?? '';
  if (!isIsoDate(from) || !isIsoDate(to)) {
    return '';
  }

  const sameYear = splitIsoDate(from)[0] === splitIsoDate(to)[0];
  const start = sameYear ? formatReportShortDate(from) : formatReportDate(from);
  return `${start}${REPORT_RANGE_SEPARATOR}${formatReportDate(to)}`;
};

/** ISO date-time as a shop-local date: `2026-10-31T23:30:00Z` → `01.11.2026`; `null` when invalid. */
export const formatReportDateTime = (value: string | null | undefined): string | null => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat(REPORT_LOCALE, REPORT_DATE_FORMAT).format(date)
    : null;
};

/** Whole days passed since an ISO date-time; `null` when it is missing or invalid. */
export const daysSince = (
  value: string | null | undefined,
  now: Date = new Date(),
): number | null => {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time)
    ? null
    : Math.max(0, Math.floor((now.getTime() - time) / REPORT_MS_IN_DAY));
};

export const resolveReportTab = (value: string | null): ReportTab =>
  REPORT_TAB_VALUES.find((tab) => tab === value) ?? REPORTS_DEFAULT_TAB;
