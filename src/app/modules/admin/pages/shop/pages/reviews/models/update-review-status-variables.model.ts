import { ReviewStatus } from './review-status.enum';

export type UpdateReviewStatusVariables = {
  id: string;
  status: ReviewStatus;
};
