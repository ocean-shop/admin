import { Component, computed, input, output } from '@angular/core';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ProductType } from '../../pages/products/models/product-type.enum';
import { ProductFormAttributes } from './components/product-form-attributes/product-form-attributes';
import { ProductFormBasicInfo } from './components/product-form-basic-info/product-form-basic-info';
import { ProductFormCategories } from './components/product-form-categories/product-form-categories';
import { ProductFormImages } from './components/product-form-images/product-form-images';
import { ProductFormPricingInventory } from './components/product-form-pricing-inventory/product-form-pricing-inventory';
import { ProductFormTags } from './components/product-form-tags/product-form-tags';
import { ProductFormAssignedAttribute } from './models/product-form-assigned-attribute.model';
import { ProductFormImageItem } from './models/product-form-image-item.model';
import { ProductFormAssignedTag } from './models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from './models/product-form-attribute-option.model';
import { ProductFormTagOption } from './models/product-form-tag-option.model';
import { ProductFormCategoryNode } from './models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from './models/product-form-category-toggle-event.model';
import { ProductFormFieldIds } from './models/product-form-field-ids.model';
import { ProductFormTexts } from './models/product-form-texts.model';

@Component({
  selector: 'app-product-form',
  imports: [
    ProductFormAttributes,
    ProductFormBasicInfo,
    ProductFormCategories,
    ProductFormImages,
    ProductFormPricingInventory,
    ProductFormTags,
  ],
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
  readonly images = input<ProductFormImageItem[]>([]);
  readonly isImageUploadLoading = input<boolean>(false);

  readonly productTypeChange = output<ProductType>();
  readonly categoryToggle = output<ProductFormCategoryToggleEvent>();
  readonly attributeSearchChange = output<string>();
  readonly attributeAssign = output<string>();
  readonly attributeUnassign = output<string>();
  readonly tagSearchChange = output<string>();
  readonly tagAssign = output<string>();
  readonly tagUnassign = output<string>();
  readonly imageFilesSelected = output<File[]>();
  readonly imageMoveUp = output<string>();
  readonly imageMoveDown = output<string>();
  readonly imageRemove = output<string>();
  readonly imageUpload = output<void>();
  protected readonly shouldShowPricingInventory = computed(
    () => this.productForm().type().value() !== ProductType.Variable,
  );

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

  protected onImageFilesSelected(files: File[]): void {
    if (this.sidebarDisabled()) {
      return;
    }

    if (!files.length) {
      return;
    }

    this.imageFilesSelected.emit(files);
  }

  protected onImageMoveUp(imageId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.imageMoveUp.emit(normalizedImageId);
  }

  protected onImageMoveDown(imageId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.imageMoveDown.emit(normalizedImageId);
  }

  protected onImageRemove(imageId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.imageRemove.emit(normalizedImageId);
  }

  protected onImageUpload(): void {
    if (this.sidebarDisabled()) {
      return;
    }

    this.imageUpload.emit();
  }
}
