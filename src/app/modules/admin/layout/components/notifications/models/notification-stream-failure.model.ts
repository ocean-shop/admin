/** Why the stream connection ended; `status` is 0 for network errors and server-side closes. */
export type NotificationStreamFailure = {
  status: number;
};
