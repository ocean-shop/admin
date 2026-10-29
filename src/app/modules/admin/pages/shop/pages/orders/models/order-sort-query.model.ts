import { OrderListQueryParams } from './order.model';

export type OrderSortQuery = Required<Pick<OrderListQueryParams, 'sortBy' | 'sortOrder'>>;
