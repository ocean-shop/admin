import { OrderPaymentStatus } from './order-payment-status.enum';
import { OrderStatus } from './order-status.enum';

/** Only the changed statuses are sent; a missing one is left untouched. */
export type UpdateOrderStatusesVariables = {
  orderId: string;
  paymentStatus?: OrderPaymentStatus;
  status?: OrderStatus;
};
