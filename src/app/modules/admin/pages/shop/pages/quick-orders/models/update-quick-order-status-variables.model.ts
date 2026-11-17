import { QuickOrderStatus } from './quick-order-status.enum';

export type UpdateQuickOrderStatusVariables = {
  id: string;
  status: QuickOrderStatus;
};
