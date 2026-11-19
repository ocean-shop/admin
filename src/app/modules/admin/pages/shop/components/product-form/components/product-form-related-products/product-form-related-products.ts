import { Component, computed, inject, input } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { Input } from '@ui/input/input';
import {
  PRODUCT_FORM_RELATED_PRODUCTS_ICONS,
  PRODUCT_FORM_RELATED_PRODUCTS_MAX,
  PRODUCT_FORM_RELATED_PRODUCTS_SEARCH_ID,
} from '../../constants/product-form.constants';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { ProductRelatedProductsService } from './services/product-related-products/product-related-products.service';

/** Ordered list of related products, added by SKU search and saved on every change. */
@Component({
  selector: 'app-product-form-related-products',
  imports: [Badge, Input, ProductFormCard],
  providers: [ProductRelatedProductsService],
  templateUrl: './product-form-related-products.html',
  styleUrl: './product-form-related-products.scss',
})
export class ProductFormRelatedProducts {
  private readonly relatedService = inject(ProductRelatedProductsService);

  readonly texts = input.required<ProductFormTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);

  protected readonly icons = PRODUCT_FORM_RELATED_PRODUCTS_ICONS;
  protected readonly inputId = PRODUCT_FORM_RELATED_PRODUCTS_SEARCH_ID;
  protected readonly maxItems = PRODUCT_FORM_RELATED_PRODUCTS_MAX;
  protected readonly items = this.relatedService.items;
  protected readonly isLoading = this.relatedService.isLoading;
  protected readonly isSaving = this.relatedService.isSaving;
  protected readonly isLimitReached = this.relatedService.isLimitReached;
  protected readonly searchValue = this.relatedService.searchValue;
  protected readonly isSearchLoading = this.relatedService.isSearchLoading;
  protected readonly searchResults = this.relatedService.searchResults;

  protected readonly interactionDisabled = computed(
    () => this.sidebarDisabled() || this.isSaving(),
  );
  protected readonly isSearchDisabled = computed(
    () => this.interactionDisabled() || this.isLimitReached(),
  );
  protected readonly isSearchOpen = computed(
    () => !this.isSearchDisabled() && !!this.searchValue().trim(),
  );

  constructor() {
    this.relatedService.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.productId(),
      isSidebarEnabled: () => !this.sidebarDisabled(),
    });
  }

  protected onSearchChange(value: string): void {
    this.relatedService.onSearchChange(value);
  }

  protected onAdd(relatedId: string): void {
    this.relatedService.onAdd(relatedId);
  }

  protected onRemove(relatedId: string): void {
    this.relatedService.onRemove(relatedId);
  }

  protected onMoveUp(relatedId: string): void {
    this.relatedService.onMoveUp(relatedId);
  }

  protected onMoveDown(relatedId: string): void {
    this.relatedService.onMoveDown(relatedId);
  }
}
