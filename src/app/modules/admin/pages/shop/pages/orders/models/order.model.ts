import { SortOrder } from '../../../models/sort-order.type';
import { OrderPaymentMethod } from './order-payment-method.enum';
import { OrderPaymentStatus } from './order-payment-status.enum';
import { OrderShippingMethod } from './order-shipping-method.enum';
import { OrderStatus } from './order-status.enum';

export type OrderProductImageApiItem = {
  id?: string | null;
  url?: string | null;
};

export type OrderProductApiItemProduct = {
  id?: string | null;
  shopId?: string | null;
  available?: boolean | null;
  createdAt?: string | null;
  description?: string | null;
  landing?: string | null;
  name?: string | null;
  oldPrice?: string | number | null;
  price?: string | number | null;
  sku?: string | null;
  status?: string | null;
  type?: string | null;
  updatedAt?: string | null;
  images?: OrderProductImageApiItem[] | null;
};

export type OrderProductApiItem = {
  id?: string | null;
  productId?: string | null;
  quantity?: number | null;
  unitPrice?: number | string | null;
  product?: OrderProductApiItemProduct | null;
};

export type OrderUserApiItem = {
  id?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
};

export type OrderApiItem = {
  id?: string | null;
  shopId?: string | null;
  userId?: string | null;
  orderNumber?: string | number | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  subtotalAmount?: number | string | null;
  discountAmount?: number | string | null;
  totalAmount?: number | string | null;
  paymentMethod?: OrderPaymentMethod | string | null;
  paymentStatus?: OrderPaymentStatus | string | null;
  shippingMethod?: OrderShippingMethod | string | null;
  shippingNumber?: string | null;
  status?: OrderStatus | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  items?: OrderProductApiItem[] | null;
  products?: OrderProductApiItem[] | null;
  user?: OrderUserApiItem | null;
  createdBy?: OrderUserApiItem | null;
  [key: string]: unknown;
};

export type OrderListResponse = {
  items: OrderApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrderListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  orderNumber?: string;
  sortBy?: 'createdAt';
  sortOrder?: SortOrder;
};

export type Order = {
  id: string;
  shopId: string;
  orderNumber: string;
  totalAmount: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};
