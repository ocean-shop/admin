import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { REVIEW_STATUS_LABELS, REVIEWS_DEFAULT_FILTERS } from '../../constants/reviews.constants';
import { ReviewStatus } from '../../models/review-status.enum';
import {
  areReviewFiltersEqual,
  buildReviewFiltersQuery,
  buildReviewInitials,
  buildReviewStars,
  formatReviewsCount,
  mapReview,
  normalizeReviewRating,
  resolveReviewStatus,
} from './review-mapping.helper';

describe('review-mapping helper', () => {
  describe('resolveReviewStatus', () => {
    it('keeps known statuses', () => {
      expect(resolveReviewStatus('approved')).toBe(ReviewStatus.Approved);
      expect(resolveReviewStatus('rejected')).toBe(ReviewStatus.Rejected);
    });

    it('falls back to pending', () => {
      expect(resolveReviewStatus('unknown')).toBe(ReviewStatus.Pending);
      expect(resolveReviewStatus(null)).toBe(ReviewStatus.Pending);
    });
  });

  describe('normalizeReviewRating', () => {
    it('rounds and clamps the rating', () => {
      expect(normalizeReviewRating(4)).toBe(4);
      expect(normalizeReviewRating(3.6)).toBe(4);
      expect(normalizeReviewRating(9)).toBe(5);
      expect(normalizeReviewRating(-2)).toBe(0);
    });

    it('returns 0 for missing or invalid values', () => {
      expect(normalizeReviewRating(null)).toBe(0);
      expect(normalizeReviewRating(undefined)).toBe(0);
      expect(normalizeReviewRating(Number.NaN)).toBe(0);
    });
  });

  it('builds one flag per star', () => {
    expect(buildReviewStars(3)).toEqual([true, true, true, false, false]);
    expect(buildReviewStars(0)).toEqual([false, false, false, false, false]);
  });

  describe('buildReviewInitials', () => {
    it('takes the first letters of up to two words', () => {
      expect(buildReviewInitials('Олена Коваль')).toBe('ОК');
      expect(buildReviewInitials('  олена   марія коваль ')).toBe('ОМ');
      expect(buildReviewInitials('Андрій')).toBe('А');
    });

    it('returns an empty string for empty names', () => {
      expect(buildReviewInitials('  ')).toBe('');
      expect(buildReviewInitials(null)).toBe('');
    });
  });

  describe('mapReview', () => {
    it('maps a full review', () => {
      const review = mapReview({
        id: 'r-1',
        productId: 'p-2',
        name: ' Олена Коваль ',
        advantages: ' Камера ',
        drawbacks: 'Ціна',
        comment: 'Чудовий телефон',
        rating: 4,
        status: 'approved',
        approvedPurchase: true,
        isUseful: 3,
        createdAt: '2026-11-23T10:00:00.000Z',
        product: { id: 'p-1', name: 'Iphone 14 pro max' },
      });

      expect(review).toEqual(
        expect.objectContaining({
          id: 'r-1',
          name: 'Олена Коваль',
          initials: 'ОК',
          rating: 4,
          ratingText: '4.0',
          ratingLabel: 'Оцінка 4 з 5',
          stars: [true, true, true, true, false],
          comment: 'Чудовий телефон',
          advantages: 'Камера',
          drawbacks: 'Ціна',
          productId: 'p-1',
          productName: 'Iphone 14 pro max',
          status: ReviewStatus.Approved,
          statusLabel: REVIEW_STATUS_LABELS[ReviewStatus.Approved],
          statusTone: 'success',
          approvedPurchase: true,
          usefulCount: 3,
          createdDate: '23.11.2026',
        }),
      );
    });

    it('uses fallbacks for missing fields', () => {
      const review = mapReview({ id: 'r-2', productId: ' p-9 ', createdAt: 'invalid' });

      expect(review).toEqual(
        expect.objectContaining({
          name: EMPTY_VALUE_PLACEHOLDER,
          initials: '',
          rating: 0,
          comment: EMPTY_VALUE_PLACEHOLDER,
          advantages: null,
          drawbacks: null,
          productId: 'p-9',
          productName: EMPTY_VALUE_PLACEHOLDER,
          status: ReviewStatus.Pending,
          approvedPurchase: false,
          usefulCount: 0,
          createdDate: EMPTY_VALUE_PLACEHOLDER,
        }),
      );
      expect(mapReview({ id: 'r-3', createdAt: null }).productId).toBeNull();
      expect(mapReview({ id: 'r-4', isUseful: -1 }).usefulCount).toBe(0);
    });
  });

  describe('buildReviewFiltersQuery', () => {
    it('sends only the sort order for default filters', () => {
      expect(buildReviewFiltersQuery(REVIEWS_DEFAULT_FILTERS)).toEqual({ sortOrder: 'desc' });
    });

    it('sends status and numeric rating when set', () => {
      expect(
        buildReviewFiltersQuery({ status: ReviewStatus.Pending, rating: '2', sortOrder: 'asc' }),
      ).toEqual({ status: ReviewStatus.Pending, rating: 2, sortOrder: 'asc' });
    });
  });

  it('compares filters by value', () => {
    expect(areReviewFiltersEqual(REVIEWS_DEFAULT_FILTERS, { ...REVIEWS_DEFAULT_FILTERS })).toBe(
      true,
    );
    expect(
      areReviewFiltersEqual(REVIEWS_DEFAULT_FILTERS, { ...REVIEWS_DEFAULT_FILTERS, rating: '5' }),
    ).toBe(false);
    expect(
      areReviewFiltersEqual(REVIEWS_DEFAULT_FILTERS, {
        ...REVIEWS_DEFAULT_FILTERS,
        status: ReviewStatus.Approved,
      }),
    ).toBe(false);
    expect(
      areReviewFiltersEqual(REVIEWS_DEFAULT_FILTERS, {
        ...REVIEWS_DEFAULT_FILTERS,
        sortOrder: 'asc',
      }),
    ).toBe(false);
  });

  it('formats the count with the Ukrainian plural form', () => {
    expect(formatReviewsCount(1)).toBe('1 відгук');
    expect(formatReviewsCount(3)).toBe('3 відгуки');
    expect(formatReviewsCount(12)).toBe('12 відгуків');
    expect(formatReviewsCount(0)).toBe('0 відгуків');
    expect(formatReviewsCount(21)).toBe('21 відгук');
  });
});
