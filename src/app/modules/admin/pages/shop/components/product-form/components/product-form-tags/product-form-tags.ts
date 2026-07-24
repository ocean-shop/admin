import { Component, input, output } from '@angular/core';
import { Chip } from '@ui/chip/chip';
import { Input } from '@ui/input/input';
import { ProductFormAssignedTag } from '../../models/product-form-assigned-tag.model';
import { ProductFormTagOption } from '../../models/product-form-tag-option.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';

@Component({
  selector: 'app-product-form-tags',
  imports: [Chip, Input],
  templateUrl: './product-form-tags.html',
  styleUrl: './product-form-tags.scss',
})
export class ProductFormTags {
  readonly texts = input.required<ProductFormTexts>();
  readonly sidebarDisabled = input<boolean>(false);
  readonly tagSearchValue = input<string>('');
  readonly isTagSearchLoading = input<boolean>(false);
  readonly tagSearchResults = input<ProductFormTagOption[]>([]);
  readonly assignedTags = input<ProductFormAssignedTag[]>([]);

  readonly tagSearchChange = output<string>();
  readonly tagAssign = output<string>();
  readonly tagUnassign = output<string>();

  protected onTagSearchChange(value: string): void {
    this.tagSearchChange.emit(value);
  }

  protected onTagAssign(tagId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedTagId = tagId.trim();
    if (!normalizedTagId) {
      return;
    }

    this.tagAssign.emit(normalizedTagId);
  }

  protected onTagUnassign(tagId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedTagId = tagId.trim();
    if (!normalizedTagId) {
      return;
    }

    this.tagUnassign.emit(normalizedTagId);
  }
}
