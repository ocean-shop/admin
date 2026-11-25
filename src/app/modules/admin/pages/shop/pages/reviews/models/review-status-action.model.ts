import { ButtonVariant } from '@ui/button/models/button-variant.type';
import { ReviewStatus } from './review-status.enum';

/** A moderation button that moves a review to `status`; hidden when the review already has it. */
export type ReviewStatusAction = {
  status: ReviewStatus;
  label: string;
  icon: string;
  variant: ButtonVariant;
};
