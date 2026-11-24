import { ReviewStatus } from './review-status.enum';

/** A moderation status, or `all` for every review regardless of status. */
export type ReviewStatusFilter = ReviewStatus | 'all';
