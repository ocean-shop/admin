import { Component, input, output } from '@angular/core';
import { ProductFormAssignedAttribute } from '../../models/product-form-assigned-attribute.model';
import { ProductFormAttributeOption } from '../../models/product-form-attribute-option.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormSharedAttributes } from '../product-form-shared-attributes/product-form-shared-attributes';

@Component({
  selector: 'app-product-form-attributes',
  imports: [ProductFormSharedAttributes],
  templateUrl: './product-form-attributes.html',
  styleUrl: './product-form-attributes.scss',
})
export class ProductFormAttributes {
  readonly texts = input.required<ProductFormTexts>();
  readonly sidebarDisabled = input<boolean>(false);
  readonly attributeSearchValue = input<string>('');
  readonly isAttributeSearchLoading = input<boolean>(false);
  readonly attributeSearchResults = input<ProductFormAttributeOption[]>([]);
  readonly assignedAttributes = input<ProductFormAssignedAttribute[]>([]);

  readonly attributeSearchChange = output<string>();
  readonly attributeAssign = output<string>();
  readonly attributeUnassign = output<string>();

  protected onAttributeSearchChange(value: string): void {
    this.attributeSearchChange.emit(value);
  }

  protected onAttributeAssign(attributeId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedAttributeId = attributeId.trim();
    if (!normalizedAttributeId) {
      return;
    }

    this.attributeAssign.emit(normalizedAttributeId);
  }

  protected onAttributeUnassign(attributeId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedAttributeId = attributeId.trim();
    if (!normalizedAttributeId) {
      return;
    }

    this.attributeUnassign.emit(normalizedAttributeId);
  }
}
