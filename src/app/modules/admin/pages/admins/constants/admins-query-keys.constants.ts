/** `scope` is the prefix of every admins query and is used to invalidate them all at once. */
export const ADMINS_QUERY_KEYS = {
  scope: ['admins'] as const,
  list: (page: number, limit: number) => ['admins', 'list', page, limit] as const,
  byId: (adminId: string) => ['admins', 'detail', adminId] as const,
  /** Key for the admin query that stays disabled until the user id is known. */
  disabled: ['admins', 'detail', 'missing-id'] as const,
};
