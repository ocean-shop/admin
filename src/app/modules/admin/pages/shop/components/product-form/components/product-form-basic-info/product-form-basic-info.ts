import { Component, input, output } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Input } from '@ui/input/input';
import { RadioGroup } from '@ui/radio-group/radio-group';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { Textarea } from '@ui/textarea/textarea';
import { ProductType } from '../../../../pages/products/models/product-type.enum';
import { ProductFormFieldIds } from '../../models/product-form-field-ids.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';

@Component({
  selector: 'app-product-form-basic-info',
  imports: [FormField, Dropdown, Input, RadioGroup, Textarea],
  templateUrl: './product-form-basic-info.html',
  styleUrl: './product-form-basic-info.scss',
})
export class ProductFormBasicInfo {
  readonly productForm = input.required<any>();
  readonly texts = input.required<ProductFormTexts>();
  readonly fieldIds = input.required<ProductFormFieldIds>();
  readonly statusOptions = input.required<DropdownOption[]>();
  readonly productTypeOptions = input.required<RadioGroupOption[]>();
  readonly productTypeSimple = input.required<ProductType>();

  readonly productTypeChange = output<ProductType>();

  protected onProductTypeOptionChange(value: string | number | boolean): void {
    if (value !== ProductType.Simple && value !== ProductType.Variable) {
      return;
    }

    this.productTypeChange.emit(value);
  }
}
