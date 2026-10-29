import { PaginatedResponse } from '@core/models/paginated-response.model';
import {
  calculateTotalPages,
  isPageChangeAllowed,
  normalizePaginationMeta,
  prependPageItem,
  removePageItem,
  resolveTotalItems,
  resolveTotalPages,
} from './pagination.helper';

type Item = { id: string };

const buildResponse = (items: Item[], total: number, limit = 2): PaginatedResponse<Item> => ({
  items,
  total,
  page: 1,
  limit,
  totalPages: calculateTotalPages(total, limit),
});

describe('pagination.helper', () => {
  it('calculateTotalPages never returns less than one page', () => {
    expect(calculateTotalPages(0, 10)).toBe(1);
    expect(calculateTotalPages(21, 10)).toBe(3);
    expect(calculateTotalPages(5, 0)).toBe(5);
  });

  it('isPageChangeAllowed rejects the same or out-of-range pages', () => {
    expect(isPageChangeAllowed(2, 1, 3)).toBe(true);
    expect(isPageChangeAllowed(1, 1, 3)).toBe(false);
    expect(isPageChangeAllowed(0, 1, 3)).toBe(false);
    expect(isPageChangeAllowed(4, 1, 3)).toBe(false);
  });

  it('resolves totals with safe fallbacks', () => {
    expect(resolveTotalItems(undefined)).toBe(0);
    expect(resolveTotalItems({ ...buildResponse([], 0), total: -3 })).toBe(0);
    expect(resolveTotalPages(undefined)).toBe(1);
    expect(resolveTotalPages({ ...buildResponse([], 0), totalPages: 0 })).toBe(1);
    expect(resolveTotalPages(buildResponse([], 7))).toBe(4);
  });

  describe('prependPageItem', () => {
    it('keeps an empty cache untouched', () => {
      expect(prependPageItem<Item>(undefined, { id: 'x' })).toBeUndefined();
    });

    it('puts the item first, trims to the page size and recalculates totals', () => {
      const result = prependPageItem(buildResponse([{ id: 'a' }, { id: 'b' }], 2), { id: 'c' });

      expect(result?.items.map((item) => item.id)).toEqual(['c', 'a']);
      expect(result?.total).toBe(3);
      expect(result?.totalPages).toBe(2);
    });
  });

  describe('removePageItem', () => {
    it('keeps an empty cache untouched', () => {
      expect(removePageItem<Item>(undefined, 'a')).toBeUndefined();
    });

    it('returns the same reference when the id is not on the page', () => {
      const response = buildResponse([{ id: 'a' }], 1);

      expect(removePageItem(response, 'zzz')).toBe(response);
    });

    it('removes the item and recalculates totals', () => {
      const result = removePageItem(buildResponse([{ id: 'a' }, { id: 'b' }], 3), 'a');

      expect(result?.items).toEqual([{ id: 'b' }]);
      expect(result?.total).toBe(2);
      expect(result?.totalPages).toBe(1);
    });

    it('never makes the total negative', () => {
      const result = removePageItem(buildResponse([{ id: 'a' }], 0), 'a');

      expect(result?.total).toBe(0);
    });
  });

  describe('normalizePaginationMeta', () => {
    const query = { page: 2, limit: 10 };

    it('falls back to the query and the item count without meta', () => {
      expect(normalizePaginationMeta(null, 25, query)).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('uses the meta fields that are present', () => {
      expect(normalizePaginationMeta({ page: 3, total: 40 }, 10, query)).toEqual({
        page: 3,
        limit: 10,
        total: 40,
        totalPages: 4,
      });
      expect(normalizePaginationMeta({ totalPages: 7 }, 0, query).totalPages).toBe(7);
    });

    it('clamps invalid values', () => {
      expect(
        normalizePaginationMeta({ page: 0, limit: 0, total: -5, totalPages: 0 }, 0, query),
      ).toEqual({ page: 1, limit: 1, total: 0, totalPages: 1 });
    });
  });
});
