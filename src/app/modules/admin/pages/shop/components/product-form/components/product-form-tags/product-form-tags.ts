import { Component, effect, inject, input, untracked } from '@angular/core';
import {
  PRODUCT_FORM_TAGS_ICON,
  PRODUCT_FORM_TAGS_INPUT_ID,
} from '../../constants/product-form.constants';
import { ProductFormAssignedTag } from '../../models/product-form-assigned-tag.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { ProductFormSharedAttributes } from '../product-form-shared-attributes/product-form-shared-attributes';
import { ProductTagsService } from './services/product-tags.service';

@Component({
  selector: 'app-product-form-tags',
  imports: [ProductFormCard, ProductFormSharedAttributes],
  providers: [ProductTagsService],
  templateUrl: './product-form-tags.html',
})
export class ProductFormTags {
  private readonly tagsService = inject(ProductTagsService);

  readonly texts = input.required<ProductFormTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialAssignedTags = input<ProductFormAssignedTag[]>([]);

  protected readonly icon = PRODUCT_FORM_TAGS_ICON;
  protected readonly inputId = PRODUCT_FORM_TAGS_INPUT_ID;
  protected readonly searchValue = this.tagsService.searchValue;
  protected readonly isSearchLoading = this.tagsService.isSearchLoading;
  protected readonly searchResults = this.tagsService.searchResults;
  protected readonly assignedTags = this.tagsService.assignedItems;

  constructor() {
    this.tagsService.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.productId(),
      isSidebarEnabled: () => !this.sidebarDisabled(),
    });

    // Seeds the service whenever the page loads a (new) product.
    effect(() => {
      const assignedTags = this.initialAssignedTags();
      untracked(() => this.tagsService.setAssignedItems(assignedTags));
    });
  }

  protected onSearchChange(value: string): void {
    this.tagsService.onSearchChange(value);
  }

  protected onAssign(tagId: string): void {
    this.tagsService.onAssign(tagId);
  }

  protected onUnassign(tagId: string): void {
    this.tagsService.onUnassign(tagId);
  }
}
