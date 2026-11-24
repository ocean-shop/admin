import { Component, input, output } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { REVIEWS_ICONS, REVIEWS_TEXTS } from '../../constants/reviews.constants';
import { Review } from '../../models/review.model';

/** Review cards with rating, texts, product link and moderation status; presentational only. */
@Component({
  selector: 'app-reviews-list',
  imports: [Badge],
  templateUrl: './reviews-list.html',
  styleUrl: './reviews-list.scss',
})
export class ReviewsList {
  public readonly reviews = input.required<Review[]>();
  public readonly loading = input<boolean>(false);
  public readonly openProduct = output<string>();

  protected readonly textData = REVIEWS_TEXTS;
  protected readonly icons = REVIEWS_ICONS;

  protected onOpenProduct(review: Review): void {
    if (review.productId) {
      this.openProduct.emit(review.productId);
    }
  }
}
