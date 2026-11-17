import { QuickOrderStatus } from './quick-order-status.enum';

export type UpdateQuickOrderPayload = {
  status: QuickOrderStatus;
};
