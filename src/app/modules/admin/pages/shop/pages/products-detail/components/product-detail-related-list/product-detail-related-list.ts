import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PRODUCTS_DETAIL_ICONS,
  PRODUCTS_DETAIL_TEXTS,
} from '../../constants/products-detail.constants';
import { ProductDetailRelatedItem } from '../../models/product-detail-related-item.model';

/** Numbered list of related products, each linking to its own detail page. */
@Component({
  selector: 'app-product-detail-related-list',
  imports: [RouterLink],
  templateUrl: './product-detail-related-list.html',
  styleUrl: './product-detail-related-list.scss',
})
export class ProductDetailRelatedList {
  public readonly items = input.required<ProductDetailRelatedItem[]>();

  protected readonly textData = PRODUCTS_DETAIL_TEXTS;
  protected readonly placeholderIcon = PRODUCTS_DETAIL_ICONS.IMAGE_PLACEHOLDER;
}
