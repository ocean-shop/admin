import { Identifiable } from '@core/models/identifiable.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { PaginationMeta } from '@core/models/pagination-meta.model';
import { PaginationQuery } from '@core/models/pagination-query.model';

export const calculateTotalPages = (total: number, limit: number): number =>
  Math.max(1, Math.ceil(total / Math.max(1, limit)));

export const isPageChangeAllowed = (
  page: number,
  currentPage: number,
  totalPages: number,
): boolean => page !== currentPage && page >= 1 && page <= totalPages;

export const resolveTotalItems = <T>(response: PaginatedResponse<T> | undefined): number =>
  Math.max(0, response?.total ?? 0);

export const resolveTotalPages = <T>(response: PaginatedResponse<T> | undefined): number =>
  Math.max(1, response?.totalPages ?? 1);

/** Optimistically puts a freshly created item on top of a cached page. */
export const prependPageItem = <T>(
  response: PaginatedResponse<T> | undefined,
  item: T,
): PaginatedResponse<T> | undefined => {
  if (!response) {
    return response;
  }

  const total = response.total + 1;
  return {
    ...response,
    items: [item, ...response.items].slice(0, response.limit),
    total,
    totalPages: calculateTotalPages(total, response.limit),
  };
};

/** Optimistically drops a deleted item from a cached page; untouched when the id is absent. */
export const removePageItem = <T extends Identifiable>(
  response: PaginatedResponse<T> | undefined,
  id: string,
): PaginatedResponse<T> | undefined => {
  if (!response) {
    return response;
  }

  const items = response.items.filter((item) => item.id !== id);
  if (items.length === response.items.length) {
    return response;
  }

  const total = Math.max(0, response.total - 1);
  return {
    ...response,
    items,
    total,
    totalPages: calculateTotalPages(total, response.limit),
  };
};

/**
 * Pagination of list endpoints that answer either with a bare array (no meta)
 * or with an envelope whose meta fields may be missing; gaps fall back to the request.
 */
export const normalizePaginationMeta = (
  meta: Partial<PaginationMeta> | null,
  itemCount: number,
  query: PaginationQuery,
): PaginationMeta => {
  const page = Math.max(1, meta?.page ?? query.page);
  const limit = Math.max(1, meta?.limit ?? query.limit);
  const total = Math.max(0, meta?.total ?? itemCount);

  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, meta?.totalPages ?? calculateTotalPages(total, limit)),
  };
};
