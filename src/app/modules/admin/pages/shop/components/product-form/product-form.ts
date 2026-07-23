import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Input } from '@ui/input/input';
import { RadioGroup } from '@ui/radio-group/radio-group';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { Textarea } from '@ui/textarea/textarea';
import { ProductType } from '../../pages/products/models/product-type.enum';
import { ProductFormAssignedAttribute } from './models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from './models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from './models/product-form-attribute-option.model';
import { ProductFormTagOption } from './models/product-form-tag-option.model';
import { ProductFormCategoryNode } from './models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from './models/product-form-category-toggle-event.model';
import { ProductFormFieldIds } from './models/product-form-field-ids.model';
import { ProductFormTexts } from './models/product-form-texts.model';

@Component({
  selector: 'app-product-form',
  imports: [FormField, Checkbox, Dropdown, Input, RadioGroup, Textarea],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  readonly productForm = input.required<any>();
  readonly texts = input.required<ProductFormTexts>();
  readonly fieldIds = input.required<ProductFormFieldIds>();
  readonly statusOptions = input.required<DropdownOption[]>();
  readonly productTypeOptions = input.required<RadioGroupOption[]>();
  readonly productTypeSimple = input.required<ProductType>();
  readonly categories = input.required<ProductFormCategoryNode[]>();
  readonly sidebarDisabled = input<boolean>(false);
  readonly attributeSearchValue = input<string>('');
  readonly isAttributeSearchLoading = input<boolean>(false);
  readonly attributeSearchResults = input<ProductFormAttributeOption[]>([]);
  readonly assignedAttributes = input<ProductFormAssignedAttribute[]>([]);
  readonly tagSearchValue = input<string>('');
  readonly isTagSearchLoading = input<boolean>(false);
  readonly tagSearchResults = input<ProductFormTagOption[]>([]);
  readonly assignedTags = input<ProductFormAssignedTag[]>([]);

  readonly productTypeChange = output<ProductType>();
  readonly categoryToggle = output<ProductFormCategoryToggleEvent>();
  readonly attributeSearchChange = output<string>();
  readonly attributeAssign = output<string>();
  readonly attributeUnassign = output<string>();
  readonly tagSearchChange = output<string>();
  readonly tagAssign = output<string>();
  readonly tagUnassign = output<string>();

  protected onProductTypeOptionChange(value: string | number | boolean): void {
    if (value !== ProductType.Simple && value !== ProductType.Variable) {
      return;
    }

    this.productTypeChange.emit(value);
  }

  protected onCategoryCheckedChange(categoryId: string, checked: boolean): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedCategoryId = categoryId.trim();
    if (!normalizedCategoryId) {
      return;
    }

    this.categoryToggle.emit({ categoryId: normalizedCategoryId, checked });
  }

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
