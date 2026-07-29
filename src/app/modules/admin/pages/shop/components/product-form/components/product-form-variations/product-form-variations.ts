import { Component, input, output } from '@angular/core';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Chip } from '@ui/chip/chip';
import { Input } from '@ui/input/input';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormVariationAttributeSearchEvent } from '../../models/product-form-variation-attribute-search-event.model';
import { ProductFormVariationAttributeToggleEvent } from '../../models/product-form-variation-attribute-toggle-event.model';
import { ProductFormVariationChangeEvent } from '../../models/product-form-variation-change-event.model';
import { ProductFormVariationCreateEvent } from '../../models/product-form-variation-create-event.model';
import { ProductFormVariationImageFilesEvent } from '../../models/product-form-variation-image-files-event.model';
import { ProductFormVariationImageToggleEvent } from '../../models/product-form-variation-image-toggle-event.model';
import { ProductFormVariationRemoveEvent } from '../../models/product-form-variation-remove-event.model';
import { ProductFormVariation } from '../../models/product-form-variation.model';

@Component({
  selector: 'app-product-form-variations',
  imports: [Checkbox, Chip, Input],
  templateUrl: './product-form-variations.html',
  styleUrl: './product-form-variations.scss',
})
export class ProductFormVariations {
  readonly texts = input.required<ProductFormTexts>();
  readonly sidebarDisabled = input<boolean>(false);
  readonly variations = input<ProductFormVariation[]>([]);

  readonly variationAdd = output<void>();
  readonly variationCreate = output<ProductFormVariationCreateEvent>();
  readonly variationRemove = output<ProductFormVariationRemoveEvent>();
  readonly variationChange = output<ProductFormVariationChangeEvent>();
  readonly variationAttributeSearchChange = output<ProductFormVariationAttributeSearchEvent>();
  readonly variationAttributeAssign = output<ProductFormVariationAttributeToggleEvent>();
  readonly variationAttributeUnassign = output<ProductFormVariationAttributeToggleEvent>();
  readonly variationImageFilesSelected = output<ProductFormVariationImageFilesEvent>();
  readonly variationImageMoveUp = output<ProductFormVariationImageToggleEvent>();
  readonly variationImageMoveDown = output<ProductFormVariationImageToggleEvent>();
  readonly variationImageRemove = output<ProductFormVariationImageToggleEvent>();

  protected onVariationAdd(): void {
    if (this.sidebarDisabled()) {
      return;
    }

    this.variationAdd.emit();
  }

  protected onVariationCreate(localId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedLocalId = localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    this.variationCreate.emit({ localId: normalizedLocalId });
  }

  protected onVariationRemove(localId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedLocalId = localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    this.variationRemove.emit({ localId: normalizedLocalId });
  }

  protected onVariationFieldChange(
    localId: string,
    field: ProductFormVariationChangeEvent['field'],
    value: string | boolean,
  ): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedLocalId = localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    this.variationChange.emit({
      localId: normalizedLocalId,
      field,
      value,
    });
  }

  protected onVariationAttributeSearchChange(localId: string, value: string): void {
    const normalizedLocalId = localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    this.variationAttributeSearchChange.emit({
      localId: normalizedLocalId,
      value,
    });
  }

  protected onVariationAttributeAssign(localId: string, attributeId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedLocalId = localId.trim();
    const normalizedAttributeId = attributeId.trim();
    if (!normalizedLocalId || !normalizedAttributeId) {
      return;
    }

    this.variationAttributeAssign.emit({
      localId: normalizedLocalId,
      attributeId: normalizedAttributeId,
    });
  }

  protected onVariationAttributeUnassign(localId: string, attributeId: string): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedLocalId = localId.trim();
    const normalizedAttributeId = attributeId.trim();
    if (!normalizedLocalId || !normalizedAttributeId) {
      return;
    }

    this.variationAttributeUnassign.emit({
      localId: normalizedLocalId,
      attributeId: normalizedAttributeId,
    });
  }

  protected onVariationImageInputChange(localId: string, event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const normalizedLocalId = localId.trim();
    const files = this.extractImageFiles(inputElement?.files);
    if (inputElement) {
      inputElement.value = '';
    }

    if (!normalizedLocalId || !files.length || this.sidebarDisabled()) {
      return;
    }

    this.variationImageFilesSelected.emit({ localId: normalizedLocalId, files });
  }

  protected onVariationImageMoveUp(localId: string, imageId: string): void {
    this.emitVariationImageAction(this.variationImageMoveUp, localId, imageId);
  }

  protected onVariationImageMoveDown(localId: string, imageId: string): void {
    this.emitVariationImageAction(this.variationImageMoveDown, localId, imageId);
  }

  protected onVariationImageRemove(localId: string, imageId: string): void {
    this.emitVariationImageAction(this.variationImageRemove, localId, imageId);
  }

  private emitVariationImageAction(
    emitter: {
      emit: (event: ProductFormVariationImageToggleEvent) => void;
    },
    localId: string,
    imageId: string,
  ): void {
    if (this.sidebarDisabled()) {
      return;
    }

    const normalizedLocalId = localId.trim();
    const normalizedImageId = imageId.trim();
    if (!normalizedLocalId || !normalizedImageId) {
      return;
    }

    emitter.emit({
      localId: normalizedLocalId,
      imageId: normalizedImageId,
    });
  }

  private extractImageFiles(fileList: FileList | null | undefined): File[] {
    if (!fileList?.length) {
      return [];
    }

    return Array.from(fileList).filter((file) => file.type.startsWith('image/'));
  }
}
