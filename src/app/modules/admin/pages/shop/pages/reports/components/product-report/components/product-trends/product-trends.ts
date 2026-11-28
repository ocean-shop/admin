import { Component, input, output } from '@angular/core';
import { ChangeBadge } from '@ui/change-badge/change-badge';
import { SectionCard } from '@ui/section-card/section-card';
import { ProductTrendList } from '../../../../models/product-report-view.model';

/** «Зростають» or «Падають» list of products vs the previous period. */
@Component({
  selector: 'app-product-trends',
  imports: [SectionCard, ChangeBadge],
  templateUrl: './product-trends.html',
  styleUrl: './product-trends.scss',
})
export class ProductTrends {
  public readonly trend = input.required<ProductTrendList>();
  public readonly openProduct = output<string>();

  protected onOpenProduct(productId: string): void {
    if (productId) {
      this.openProduct.emit(productId);
    }
  }
}
