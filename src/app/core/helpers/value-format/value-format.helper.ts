import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import {
  VALUE_FORMAT_AMOUNT_FRACTION_DIGITS,
  VALUE_FORMAT_LIST_SEPARATOR,
  VALUE_FORMAT_TEXTS,
  VALUE_FORMAT_WORD_SEPARATOR_PATTERN,
} from '@core/constants/value-format.constants';

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Any id-like API value (string, number, null) as a trimmed string; empty when missing. */
export const toTrimmedString = (value: unknown): string => String(value ?? '').trim();

/** Trimmed string or the empty-value placeholder. */
export const formatText = (value: unknown): string =>
  (typeof value === 'string' && value.trim()) || EMPTY_VALUE_PLACEHOLDER;

export const formatNumber = (value: unknown): string =>
  isFiniteNumber(value) ? String(value) : EMPTY_VALUE_PLACEHOLDER;

/** Numbers as-is, numeric-ish strings trimmed (e.g. order numbers that may be either). */
export const formatNumberOrText = (value: unknown): string =>
  isFiniteNumber(value) ? String(value) : formatText(value);

export const formatAmount = (value: unknown): string =>
  isFiniteNumber(value) ? value.toFixed(VALUE_FORMAT_AMOUNT_FRACTION_DIGITS) : formatText(value);

export const formatDate = (value: string | null | undefined): string => {
  const normalized = value?.trim();
  if (!normalized) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? normalized : parsed.toLocaleString();
};

/** `"in_progress"` → `"In Progress"`. */
export const formatStatus = (value: unknown): string => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!normalized) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return normalized
    .split(VALUE_FORMAT_WORD_SEPARATOR_PATTERN)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatBoolean = (value: unknown): string => {
  if (typeof value !== 'boolean') {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return value ? VALUE_FORMAT_TEXTS.YES : VALUE_FORMAT_TEXTS.NO;
};

/** Primitives as text, objects as JSON; unknown or unserializable values become the placeholder. */
export const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  if (typeof value === 'string') {
    return formatText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value) ?? EMPTY_VALUE_PLACEHOLDER;
  } catch {
    return EMPTY_VALUE_PLACEHOLDER;
  }
};

export const joinOrPlaceholder = (
  values: string[],
  separator = VALUE_FORMAT_LIST_SEPARATOR,
): string => (values.length ? values.join(separator) : EMPTY_VALUE_PLACEHOLDER);
