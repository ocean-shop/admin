import { Component, input, output } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { Button } from '@ui/button/button';
import {
  REVIEW_STATUS_ACTIONS,
  REVIEWS_ICONS,
  REVIEWS_TEXTS,
} from '../../constants/reviews.constants';
import { Review } from '../../models/review.model';
import { ReviewStatus } from '../../models/review-status.enum';
import { UpdateReviewStatusVariables } from '../../models/update-review-status-variables.model';

/** Review cards with rating, texts, product link and moderation actions; presentational only. */
@Component({
  selector: 'app-reviews-list',
  imports: [Badge, Button],
  templateUrl: './reviews-list.html',
  styleUrl: './reviews-list.scss',
})
export class ReviewsList {
  public readonly reviews = input.required<Review[]>();
  public readonly loading = input<boolean>(false);
  /** Status change in flight; its button shows a spinner and all moderation actions are locked. */
  public readonly pendingStatusChange = input<UpdateReviewStatusVariables | null>(null);
  public readonly openProduct = output<string>();
  public readonly statusChange = output<UpdateReviewStatusVariables>();

  protected readonly textData = REVIEWS_TEXTS;
  protected readonly icons = REVIEWS_ICONS;
  protected readonly statusActions = REVIEW_STATUS_ACTIONS;

  protected onOpenProduct(review: Review): void {
    if (review.productId) {
      this.openProduct.emit(review.productId);
    }
  }

  protected onStatusChange(review: Review, status: ReviewStatus): void {
    if (!this.pendingStatusChange() && review.status !== status) {
      this.statusChange.emit({ id: review.id, status });
    }
  }
}
