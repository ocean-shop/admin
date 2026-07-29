import { Component, effect, inject, input, untracked } from '@angular/core';
import { Chip } from '@ui/chip/chip';
import { Input } from '@ui/input/input';
import { ProductFormAssignedTag } from '../../models/product-form-assigned-tag.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductTagsToastTexts } from './models/product-tags-toast-texts.model';
import { ProductTagsService } from './services/product-tags.service';

@Component({
  selector: 'app-product-form-tags',
  imports: [Chip, Input],
  providers: [ProductTagsService],
  templateUrl: './product-form-tags.html',
  styleUrl: './product-form-tags.scss',
})
export class ProductFormTags {
  private readonly tagsService = inject(ProductTagsService);

  readonly texts = input.required<ProductFormTexts>();
  readonly toastTexts = input.required<ProductTagsToastTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialAssignedTags = input<ProductFormAssignedTag[]>([]);

  protected readonly tagSearchValue = this.tagsService.tagSearchValue;
  protected readonly isTagSearchLoading = this.tagsService.isTagSearchLoading;
  protected readonly tagSearchResults = this.tagsService.tagSearchResults;
  protected readonly assignedTags = this.tagsService.assignedTags;

  constructor() {
    this.tagsService.configure(
      {
        getShopId: () => this.shopId(),
        getProductId: () => this.productId(),
        isSidebarEnabled: () => !this.sidebarDisabled(),
      },
      () => this.toastTexts(),
    );

    effect(() => {
      const assignedTags = this.initialAssignedTags();
      untracked(() => this.tagsService.setAssignedTags(assignedTags));
    });
  }

  protected onTagSearchChange(value: string): void {
    this.tagsService.onTagSearchChange(value);
  }

  protected onTagAssign(tagId: string): void {
    this.tagsService.onTagAssign(tagId);
  }

  protected onTagUnassign(tagId: string): void {
    this.tagsService.onTagUnassign(tagId);
  }
}
