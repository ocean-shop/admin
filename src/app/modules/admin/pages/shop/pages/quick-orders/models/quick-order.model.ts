import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { QuickOrderStatus } from './quick-order-status.enum';

export type QuickOrderProductApiItem = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
};

/** "Buy in one click" request as `GET /quick-orders` returns it. */
export type QuickOrderApiItem = {
  id: string;
  shopId?: string | null;
  productId?: string | null;
  name?: string | null;
  phone?: string | null;
  status?: QuickOrderStatus | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  product?: QuickOrderProductApiItem | null;
};

export type QuickOrderListResponse = PaginatedResponse<QuickOrderApiItem>;

export type QuickOrderListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  status?: QuickOrderStatus;
  search?: string;
};

/** A quick order ready for the table. */
export type QuickOrder = {
  id: string;
  name: string;
  phone: string;
  phoneHref: string | null;
  productId: string | null;
  productName: string;
  status: QuickOrderStatus;
  statusLabel: string;
  statusTone: BadgeTone;
  createdDate: string;
  createdTime: string;
};
