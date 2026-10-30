import { Component, computed, input, output } from '@angular/core';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Input } from '@ui/input/input';
import {
  PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES,
  PRODUCT_FORM_VARIATION_REMOVE_ICON,
} from '../../../../constants/product-form.constants';
import { buildVariationFieldIds } from '../../helpers/product-variation-field-ids/product-variation-field-ids.helper';
import { ProductFormTexts } from '../../../../models/product-form-texts.model';
import { ProductFormVariationChangeEvent } from '../../../../models/product-form-variation-change-event.model';
import { ProductFormVariationFieldChange } from '../../../../models/product-form-variation-field-change.model';
import { ProductFormVariation } from '../../../../models/product-form-variation.model';
import { ProductFormSharedAttributes } from '../../../product-form-shared-attributes/product-form-shared-attributes';
import { ProductFormSharedImages } from '../../../product-form-shared-images/product-form-shared-images';

/** Editor of a single variation: fields, attributes and images; the parent owns the state. */
@Component({
  selector: 'app-product-form-variation-card',
  imports: [Checkbox, Input, ProductFormSharedAttributes, ProductFormSharedImages],
  templateUrl: './product-form-variation-card.html',
  styleUrl: './product-form-variation-card.scss',
})
export class ProductFormVariationCard {
  readonly variation = input.required<ProductFormVariation>();
  readonly index = input.required<number>();
  readonly texts = input.required<ProductFormTexts>();
  readonly disabled = input<boolean>(false);

  readonly fieldChange = output<ProductFormVariationFieldChange>();
  readonly attributeSearchChange = output<string>();
  readonly attributeAssign = output<string>();
  readonly attributeUnassign = output<string>();
  readonly imageFilesSelected = output<File[]>();
  readonly imageMoveUp = output<string>();
  readonly imageMoveDown = output<string>();
  readonly imageRemove = output<string>();
  readonly removed = output<void>();
  readonly saved = output<void>();

  protected readonly removeIcon = PRODUCT_FORM_VARIATION_REMOVE_ICON;
  protected readonly title = computed(
    () => `${this.texts().VARIATION_CARD_TITLE} #${this.index() + 1}`,
  );
  protected readonly fieldIds = computed(() =>
    buildVariationFieldIds(PRODUCT_FORM_VARIATION_FIELD_ID_PREFIXES, this.variation().localId),
  );
  protected readonly isSaveDisabled = computed(() => this.disabled() || this.variation().isSaving);
  protected readonly saveButtonLabel = computed(() => {
    const texts = this.texts();
    if (this.variation().isSaving) {
      return texts.VARIATION_CREATE_LOADING_BUTTON_LABEL;
    }

    return this.variation().id
      ? texts.VARIATION_UPDATE_BUTTON_LABEL
      : texts.VARIATION_CREATE_BUTTON_LABEL;
  });

  protected onFieldChange(
    field: ProductFormVariationChangeEvent['field'],
    value: string | boolean,
  ): void {
    this.fieldChange.emit({ field, value });
  }
}
