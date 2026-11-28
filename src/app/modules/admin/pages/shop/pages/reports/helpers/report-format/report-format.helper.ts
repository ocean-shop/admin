import { ChangeBadgeData } from '@ui/change-badge/models/change-badge-data.model';
import { ChangeDirection } from '@ui/change-badge/models/change-direction.type';
import { ChangeTone } from '@ui/change-badge/models/change-tone.type';
import {
  REPORT_CURRENCY_SIGN,
  REPORT_DIGITS,
  REPORT_LOCALE,
  REPORT_MINUS_SIGN,
  REPORT_PERCENT,
  REPORT_PERCENT_SIGN,
  REPORT_PLURAL_LOCALE,
  REPORT_PLUS_SIGN,
  REPORT_POINTS_SUFFIX,
} from '../../constants/report-format.constants';

const WHITESPACE_PATTERN = /\s/g;

/** Finite number or 0: API aggregates may be missing. */
export const toReportNumber = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

/** Grouped number with a fixed amount of decimals; Intl's narrow spaces become plain ones. */
const formatFixed = (value: number, digits: number): string =>
  new Intl.NumberFormat(REPORT_LOCALE, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
    .format(value)
    .replace(WHITESPACE_PATTERN, ' ');

/** `241 600 ₴` */
export const formatReportMoney = (value: number | null | undefined): string =>
  `${formatFixed(Math.round(toReportNumber(value)), 0)} ${REPORT_CURRENCY_SIGN}`;

/** `1 284` */
export const formatReportCount = (value: number | null | undefined): string =>
  formatFixed(Math.round(toReportNumber(value)), 0);

/** `2,3` */
export const formatReportDecimal = (
  value: number | null | undefined,
  digits: number = REPORT_DIGITS.AVERAGE,
): string => formatFixed(toReportNumber(value), digits);

/** Ratio 0..1 as percents: `60%`, `8,4%`. */
export const formatReportShare = (
  ratio: number | null | undefined,
  digits: number = REPORT_DIGITS.SHARE,
): string => `${formatFixed(toReportNumber(ratio) * REPORT_PERCENT, digits)}${REPORT_PERCENT_SIGN}`;

/** `3 товари`, `25 замовлень` */
export const formatReportCountWithWord = (
  count: number | null | undefined,
  words: Record<Intl.LDMLPluralRule, string>,
): string => {
  const rounded = Math.round(toReportNumber(count));
  return `${formatReportCount(rounded)} ${words[new Intl.PluralRules(REPORT_PLURAL_LOCALE).select(rounded)]}`;
};

const roundTo = (value: number, digits: number): number => Number(value.toFixed(digits));

const resolveDirection = (value: number): ChangeDirection => {
  if (value > 0) {
    return 'up';
  }

  return value < 0 ? 'down' : 'flat';
};

const resolveTone = (value: number, higherIsBetter: boolean): ChangeTone => {
  if (value === 0) {
    return 'neutral';
  }

  return value > 0 === higherIsBetter ? 'success' : 'danger';
};

const formatSigned = (value: number, digits: number, suffix: string): string => {
  const sign = value > 0 ? REPORT_PLUS_SIGN : value < 0 ? REPORT_MINUS_SIGN : '';
  return `${sign}${formatFixed(Math.abs(value), digits)}${suffix}`;
};

const buildChange = (value: number, suffix: string, higherIsBetter: boolean): ChangeBadgeData => {
  const rounded = roundTo(value, REPORT_DIGITS.CHANGE);
  return {
    label: formatSigned(rounded, REPORT_DIGITS.CHANGE, suffix),
    direction: resolveDirection(rounded),
    tone: resolveTone(rounded, higherIsBetter),
  };
};

/** Percent change from the API (`5` → `+5,0%`); `null` when there is no base to compare with. */
export const buildPercentChange = (
  change: number | null | undefined,
  higherIsBetter = true,
): ChangeBadgeData | null =>
  typeof change === 'number' && Number.isFinite(change)
    ? buildChange(change, REPORT_PERCENT_SIGN, higherIsBetter)
    : null;

/** Difference of two ratios in percentage points: `+3,3 п.п.` */
export const buildPointsChange = (
  current: number | null | undefined,
  previous: number | null | undefined,
  higherIsBetter = true,
): ChangeBadgeData =>
  buildChange(
    (toReportNumber(current) - toReportNumber(previous)) * REPORT_PERCENT,
    ` ${REPORT_POINTS_SUFFIX}`,
    higherIsBetter,
  );
