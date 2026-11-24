import { SortOrder } from '../../../models/sort-order.type';
import { ReviewRatingFilter } from './review-rating-filter.type';
import { ReviewStatusFilter } from './review-status-filter.type';

export type ReviewFilters = {
  status: ReviewStatusFilter;
  rating: ReviewRatingFilter;
  sortOrder: SortOrder;
};
