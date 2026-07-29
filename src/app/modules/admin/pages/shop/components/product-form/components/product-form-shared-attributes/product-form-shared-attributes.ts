import { Component, input, output } from '@angular/core';
import { Chip } from '@ui/chip/chip';
import { Input } from '@ui/input/input';
import { ProductFormAttributeOption } from '../../models/product-form-attribute-option.model';
import { ProductFormAttributeItem } from '../../models/product-form-attribute-item.model';

@Component({
  selector: 'app-product-form-shared-attributes',
  imports: [Chip, Input],
  templateUrl: './product-form-shared-attributes.html',
  styleUrl: './product-form-shared-attributes.scss',
})
export class ProductFormSharedAttributes {
  readonly searchInputId = input.required<string>();
  readonly searchLabel = input.required<string>();
  readonly searchPlaceholder = input.required<string>();
  readonly searchValue = input<string>('');
  readonly interactionDisabled = input<boolean>(false);
  readonly isSearchLoading = input<boolean>(false);
  readonly searchLoadingText = input.required<string>();
  readonly searchEmptyText = input.required<string>();
  readonly assignedEmptyText = input.required<string>();
  readonly removeAriaLabel = input.required<string>();
  readonly searchResults = input<ProductFormAttributeOption[]>([]);
  readonly assignedAttributes = input<ProductFormAttributeItem[]>([]);
  readonly compactLayout = input<boolean>(false);

  readonly searchChange = output<string>();
  readonly assign = output<string>();
  readonly unassign = output<string>();

  protected onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  protected onAssign(attributeId: string): void {
    if (this.interactionDisabled()) {
      return;
    }

    const normalizedAttributeId = attributeId.trim();
    if (!normalizedAttributeId) {
      return;
    }

    this.assign.emit(normalizedAttributeId);
  }

  protected onUnassign(attributeId: string): void {
    if (this.interactionDisabled()) {
      return;
    }

    const normalizedAttributeId = attributeId.trim();
    if (!normalizedAttributeId) {
      return;
    }

    this.unassign.emit(normalizedAttributeId);
  }
}
