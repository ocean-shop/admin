import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { calculateTotalPages } from '@core/helpers/pagination/pagination.helper';
import { formatText } from '@core/helpers/value-format/value-format.helper';
import {
  REVIEW_DATE_FORMAT,
  REVIEW_DATE_LOCALE,
  REVIEW_INITIALS_MAX_LENGTH,
  REVIEW_NAME_SEPARATOR_PATTERN,
  REVIEW_RATING_FRACTION_DIGITS,
  REVIEW_RATING_MAX,
  REVIEW_STATUS_BADGE_TONES,
  REVIEW_STATUS_LABELS,
  REVIEWS_ALL_FILTER,
  REVIEWS_COUNT_WORDS,
  REVIEWS_PLURAL_LOCALE,
  REVIEWS_TEXTS,
} from '../../constants/reviews.constants';
import { ReviewFilters } from '../../models/review-filters.model';
import { ReviewStatus } from '../../models/review-status.enum';
import { ReviewStatusFilter } from '../../models/review-status-filter.type';
import {
  Review,
  ReviewApiItem,
  ReviewListQueryParams,
  ReviewListResponse,
} from '../../models/review.model';

/** Unknown statuses are treated as pending so the review is never shown as published. */
export const resolveReviewStatus = (value: string | null | undefined): ReviewStatus =>
  Object.values(ReviewStatus).find((status) => status === value) ?? ReviewStatus.Pending;

/** Whole rating within `0…REVIEW_RATING_MAX`; missing or invalid values become 0. */
export const normalizeReviewRating = (value: number | null | undefined): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(REVIEW_RATING_MAX, Math.max(0, Math.round(value)))
    : 0;

export const buildReviewStars = (rating: number): boolean[] =>
  Array.from({ length: REVIEW_RATING_MAX }, (_, index) => index < rating);

/** `Олена Коваль` → `ОК`; empty names get no initials. */
export const buildReviewInitials = (name: string | null | undefined): string =>
  (name ?? '')
    .trim()
    .split(REVIEW_NAME_SEPARATOR_PATTERN)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, REVIEW_INITIALS_MAX_LENGTH);

const formatReviewDate = (value: string | null | undefined): string => {
  const normalized = value?.trim();
  const parsed = new Date(normalized ?? '');
  return normalized && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleDateString(REVIEW_DATE_LOCALE, REVIEW_DATE_FORMAT)
    : EMPTY_VALUE_PLACEHOLDER;
};

const toOptionalText = (value: string | null | undefined): string | null => value?.trim() || null;

export const mapReview = (item: ReviewApiItem): Review => {
  const status = resolveReviewStatus(item.status);
  const rating = normalizeReviewRating(item.rating);

  return {
    id: item.id,
    name: formatText(item.name),
    initials: buildReviewInitials(item.name),
    rating,
    ratingText: rating.toFixed(REVIEW_RATING_FRACTION_DIGITS),
    ratingLabel: `${REVIEWS_TEXTS.RATING_LABEL_PREFIX} ${rating} ${REVIEWS_TEXTS.RATING_LABEL_SEPARATOR} ${REVIEW_RATING_MAX}`,
    stars: buildReviewStars(rating),
    comment: formatText(item.comment),
    advantages: toOptionalText(item.advantages),
    drawbacks: toOptionalText(item.drawbacks),
    productId: item.product?.id?.trim() || item.productId?.trim() || null,
    productName: formatText(item.product?.name),
    status,
    statusLabel: REVIEW_STATUS_LABELS[status],
    statusTone: REVIEW_STATUS_BADGE_TONES[status],
    approvedPurchase: item.approvedPurchase === true,
    usefulCount: Math.max(0, item.isUseful ?? 0),
    createdDate: formatReviewDate(item.createdAt),
  };
};

/** Optional list params for the applied filters; `all` sends no status/rating. */
export const buildReviewFiltersQuery = (
  filters: ReviewFilters,
): Pick<ReviewListQueryParams, 'status' | 'rating' | 'sortOrder'> => ({
  ...(filters.status !== REVIEWS_ALL_FILTER ? { status: filters.status } : {}),
  ...(filters.rating !== REVIEWS_ALL_FILTER ? { rating: Number(filters.rating) } : {}),
  sortOrder: filters.sortOrder,
});

export const areReviewFiltersEqual = (left: ReviewFilters, right: ReviewFilters): boolean =>
  left.status === right.status &&
  left.rating === right.rating &&
  left.sortOrder === right.sortOrder;

/**
 * Cached list after a moderation change: the review keeps its place when it still matches
 * the status filter, otherwise it leaves the page and the total shrinks.
 */
export const applyReviewStatusChange = (
  response: ReviewListResponse | undefined,
  id: string,
  status: ReviewStatus,
  statusFilter: ReviewStatusFilter,
): ReviewListResponse | undefined => {
  if (!response || !response.items.some((item) => item.id === id)) {
    return response;
  }

  if (statusFilter === REVIEWS_ALL_FILTER || statusFilter === status) {
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

/** `1 відгук`, `3 відгуки`, `12 відгуків`. */
export const formatReviewsCount = (total: number): string =>
  `${total} ${REVIEWS_COUNT_WORDS[new Intl.PluralRules(REVIEWS_PLURAL_LOCALE).select(total)]}`;
