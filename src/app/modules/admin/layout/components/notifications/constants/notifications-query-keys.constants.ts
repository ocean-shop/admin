/** `scope` / `shopScope` / `listScope` are prefixes used to invalidate or patch several queries at once. */
export const NOTIFICATIONS_QUERY_KEYS = {
  scope: ['notifications'] as const,
  shopScope: (shopId: string) => ['notifications', shopId] as const,
  listScope: (shopId: string) => ['notifications', shopId, 'list'] as const,
  list: (shopId: string, unreadOnly: boolean) =>
    ['notifications', shopId, 'list', unreadOnly] as const,
  unreadCount: (shopId: string) => ['notifications', shopId, 'unread-count'] as const,
};
