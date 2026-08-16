import { OrderStatus } from './order-status.enum';

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};
