import { ReviewStatus } from './review-status.enum';

/** Body of `PATCH /catalog/product-reviews/:id/status`. */
export type UpdateReviewStatusPayload = {
  status: ReviewStatus;
};
