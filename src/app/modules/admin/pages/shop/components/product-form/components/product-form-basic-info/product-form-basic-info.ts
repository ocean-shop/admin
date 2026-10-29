import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Input } from '@ui/input/input';
import { RadioGroup } from '@ui/radio-group/radio-group';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { Textarea } from '@ui/textarea/textarea';
import { ProductType } from '../../../../pages/products/models/product-type.enum';
import { ProductFormFieldIds } from '../../models/product-form-field-ids.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormTree } from '../../models/product-form-tree.model';
import { ProductFormCard } from '../product-form-card/product-form-card';

@Component({
  selector: 'app-product-form-basic-info',
  imports: [ProductFormCard, Checkbox, FormField, Dropdown, Input, RadioGroup, Textarea],
  templateUrl: './product-form-basic-info.html',
  styleUrl: './product-form-basic-info.scss',
})
export class ProductFormBasicInfo {
  readonly productForm = input.required<ProductFormTree>();
  readonly texts = input.required<ProductFormTexts>();
  readonly fieldIds = input.required<ProductFormFieldIds>();
  readonly statusOptions = input.required<DropdownOption[]>();
  readonly productTypeOptions = input.required<RadioGroupOption[]>();

  /** The radio group emits loose values; only known product types reach the form. */
  protected onProductTypeOptionChange(value: string | number | boolean): void {
    if (value === ProductType.Simple || value === ProductType.Variable) {
      this.productForm().type().value.set(value);
    }
  }
}
