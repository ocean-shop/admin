/** `scope` is the prefix of every shops query and is used to invalidate them all at once. */
export const SHOPS_QUERY_KEYS = {
  scope: ['shops'] as const,
  list: (page: number, limit: number) => ['shops', 'list', page, limit] as const,
  /** Every shop at once, for pickers. */
  all: ['shops', 'all'] as const,
};
