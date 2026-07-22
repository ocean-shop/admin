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
  readonly staticAttributes = input.required<string[]>();
  readonly staticTags = input.required<string[]>();

  readonly productTypeChange = output<ProductType>();
  readonly categoryToggle = output<ProductFormCategoryToggleEvent>();

  protected onProductTypeOptionChange(value: string | number | boolean): void {
    if (value !== ProductType.Simple && value !== ProductType.Variable) {
      return;
    }

    this.productTypeChange.emit(value);
  }

  protected onCategoryCheckedChange(categoryId: string, checked: boolean): void {
    const normalizedCategoryId = categoryId.trim();
    if (!normalizedCategoryId) {
      return;
    }

    this.categoryToggle.emit({ categoryId: normalizedCategoryId, checked });
  }
}
