import { OrderPaymentStatus } from './order-payment-status.enum';

export type UpdateOrderPaymentStatusPayload = {
  paymentStatus: OrderPaymentStatus;
};

export type UpdateOrderPaymentStatusVariables = UpdateOrderPaymentStatusPayload & {
  orderId: string;
};
