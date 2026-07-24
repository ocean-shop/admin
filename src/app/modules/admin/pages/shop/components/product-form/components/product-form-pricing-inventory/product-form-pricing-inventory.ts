import { Component, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Input } from '@ui/input/input';
import { ProductFormFieldIds } from '../../models/product-form-field-ids.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';

@Component({
  selector: 'app-product-form-pricing-inventory',
  imports: [FormField, Checkbox, Dropdown, Input],
  templateUrl: './product-form-pricing-inventory.html',
  styleUrl: './product-form-pricing-inventory.scss',
})
export class ProductFormPricingInventory {
  readonly productForm = input.required<any>();
  readonly texts = input.required<ProductFormTexts>();
  readonly fieldIds = input.required<ProductFormFieldIds>();
  readonly statusOptions = input.required<DropdownOption[]>();
}
