import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { calculateTotalPages } from '@core/helpers/pagination/pagination.helper';
import { formatText } from '@core/helpers/value-format/value-format.helper';
import {
  QUICK_ORDER_DATE_FORMAT,
  QUICK_ORDER_DATE_LOCALE,
  QUICK_ORDER_NON_DIGIT_PATTERN,
  QUICK_ORDER_PHONE_FORMAT,
  QUICK_ORDER_PHONE_HREF_PREFIX,
  QUICK_ORDER_PHONE_PATTERN,
  QUICK_ORDER_PHONE_SEARCH_PATTERN,
  QUICK_ORDER_STATUS_BADGE_TONES,
  QUICK_ORDER_STATUS_LABELS,
  QUICK_ORDER_TIME_FORMAT,
  QUICK_ORDER_WHITESPACE_PATTERN,
  QUICK_ORDERS_ALL_TAB,
} from '../../constants/quick-orders.constants';
import { QuickOrderCounts } from '../../models/quick-order-counts.type';
import { QuickOrderStatus } from '../../models/quick-order-status.enum';
import { QuickOrderTab } from '../../models/quick-order-tab.type';
import { QuickOrderTabOption } from '../../models/quick-order-tab-option.model';
import { QuickOrderTabView } from '../../models/quick-order-tab-view.model';
import {
  QuickOrder,
  QuickOrderApiItem,
  QuickOrderListResponse,
} from '../../models/quick-order.model';

/** Unknown statuses are treated as new so the request is never lost from the "new" queue. */
export const resolveQuickOrderStatus = (value: string | null | undefined): QuickOrderStatus =>
  Object.values(QuickOrderStatus).find((status) => status === value) ?? QuickOrderStatus.New;

/** Status filter for the list request; the `all` tab sends none. */
export const resolveQuickOrderTabStatus = (tab: QuickOrderTab): QuickOrderStatus | undefined =>
  tab === QUICK_ORDERS_ALL_TAB ? undefined : tab;

/** `+380671234567` → `+380 67 123 45 67`; other formats are shown as-is. */
export const formatQuickOrderPhone = (phone: string | null | undefined): string => {
  const normalized = phone?.replace(QUICK_ORDER_WHITESPACE_PATTERN, '') ?? '';
  if (!normalized) {
    return EMPTY_VALUE_PLACEHOLDER;
  }

  return QUICK_ORDER_PHONE_PATTERN.test(normalized)
    ? normalized.replace(QUICK_ORDER_PHONE_PATTERN, QUICK_ORDER_PHONE_FORMAT)
    : normalized;
};

export const buildQuickOrderPhoneHref = (phone: string | null | undefined): string | null => {
  const normalized = phone?.replace(QUICK_ORDER_WHITESPACE_PATTERN, '') ?? '';
  return normalized ? `${QUICK_ORDER_PHONE_HREF_PREFIX}${normalized}` : null;
};

const parseDate = (value: string | null | undefined): Date | null => {
  const parsed = new Date(value?.trim() ?? '');
  return value?.trim() && !Number.isNaN(parsed.getTime()) ? parsed : null;
};

export const mapQuickOrder = (item: QuickOrderApiItem): QuickOrder => {
  const status = resolveQuickOrderStatus(item.status);
  const createdAt = parseDate(item.createdAt);

  return {
    id: item.id,
    name: formatText(item.name),
    phone: formatQuickOrderPhone(item.phone),
    phoneHref: buildQuickOrderPhoneHref(item.phone),
    productId: item.product?.id?.trim() || item.productId?.trim() || null,
    productName: formatText(item.product?.name),
    status,
    statusLabel: QUICK_ORDER_STATUS_LABELS[status],
    statusTone: QUICK_ORDER_STATUS_BADGE_TONES[status],
    createdDate: createdAt
      ? createdAt.toLocaleDateString(QUICK_ORDER_DATE_LOCALE, QUICK_ORDER_DATE_FORMAT)
      : EMPTY_VALUE_PLACEHOLDER,
    createdTime: createdAt
      ? createdAt.toLocaleTimeString(QUICK_ORDER_DATE_LOCALE, QUICK_ORDER_TIME_FORMAT)
      : '',
  };
};

/**
 * The API searches by name or phone with `ILIKE`; phones are stored without spaces,
 * so a phone-like term (`067 123 45 67`) is reduced to its digits.
 */
export const normalizeQuickOrderSearch = (term: string): string => {
  const trimmed = term.trim();
  return QUICK_ORDER_PHONE_SEARCH_PATTERN.test(trimmed)
    ? trimmed.replace(QUICK_ORDER_NON_DIGIT_PATTERN, '')
    : trimmed;
};

/** Pairs every tab with the `total` of its count request (same order as `tabs`). */
export const buildQuickOrderCounts = (
  tabs: QuickOrderTabOption[],
  responses: QuickOrderListResponse[],
): QuickOrderCounts =>
  tabs.reduce(
    (counts, tab, index) => ({ ...counts, [tab.value]: Math.max(0, responses[index]?.total ?? 0) }),
    {} as QuickOrderCounts,
  );

export const buildQuickOrderTabViews = (
  tabs: QuickOrderTabOption[],
  counts: QuickOrderCounts | undefined,
): QuickOrderTabView[] =>
  tabs.map((tab) => {
    const count = counts?.[tab.value];
    return { ...tab, countLabel: count === undefined ? null : String(count) };
  });

/**
 * Optimistic cache update after a status change: on the `all` tab the row stays with the new
 * status, on a status tab it leaves the page because it no longer matches the filter.
 */
export const applyQuickOrderStatusChange = (
  response: QuickOrderListResponse | undefined,
  id: string,
  status: QuickOrderStatus,
  tab: QuickOrderTab,
): QuickOrderListResponse | undefined => {
  if (!response || !response.items.some((item) => item.id === id)) {
    return response;
  }

  if (tab === QUICK_ORDERS_ALL_TAB || tab === status) {
    return {
      ...response,
      items: response.items.map((item) => (item.id === id ? { ...item, status } : item)),
    };
  }

  const total = Math.max(0, response.total - 1);
  return {
    ...response,
    items: response.items.filter((item) => item.id !== id),
    total,
    totalPages: calculateTotalPages(total, response.limit),
  };
};
