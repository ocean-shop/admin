import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { SortOrder } from '../../../models/sort-order.type';
import { ReviewStatus } from './review-status.enum';

export type ReviewProductApiItem = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
};

/** Product review as `GET /catalog/product-reviews` returns it. */
export type ReviewApiItem = {
  id: string;
  shopId?: string | null;
  productId?: string | null;
  userId?: string | null;
  name?: string | null;
  advantages?: string | null;
  drawbacks?: string | null;
  comment?: string | null;
  rating?: number | null;
  status?: ReviewStatus | string | null;
  approvedPurchase?: boolean | null;
  isUseful?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  product?: ReviewProductApiItem | null;
};

export type ReviewListResponse = PaginatedResponse<ReviewApiItem>;

export type ReviewListQueryParams = {
  page: number;
  limit: number;
  shopId: string;
  status?: ReviewStatus;
  rating?: number;
  sortOrder?: SortOrder;
};

/** A review ready for the list. `stars` holds one flag per star: filled or empty. */
export type Review = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  ratingText: string;
  ratingLabel: string;
  stars: boolean[];
  comment: string;
  advantages: string | null;
  drawbacks: string | null;
  productId: string | null;
  productName: string;
  status: ReviewStatus;
  statusLabel: string;
  statusTone: BadgeTone;
  approvedPurchase: boolean;
  usefulCount: number;
  createdDate: string;
};
