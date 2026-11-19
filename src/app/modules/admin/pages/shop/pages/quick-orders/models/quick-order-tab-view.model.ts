import { QuickOrderTabOption } from './quick-order-tab-option.model';

/** Tab with its counter; `countLabel` is null until the counts are loaded. */
export type QuickOrderTabView = QuickOrderTabOption & {
  countLabel: string | null;
};
