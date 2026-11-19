import { QuickOrderStatus } from './quick-order-status.enum';

/** A status tab, or `all` for every request regardless of status. */
export type QuickOrderTab = QuickOrderStatus | 'all';
