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
import { ProductFormVariations } from './components/product-form-variations/product-form-variations';
import { ProductFormAssignedAttribute } from './models/product-form-assigned-attribute.model';
import { ProductFormImageItem } from './models/product-form-image-item.model';
import { ProductFormAssignedTag } from './models/product-form-assigned-tag.model';
import { ProductFormFieldIds } from './models/product-form-field-ids.model';
import { ProductFormTexts } from './models/product-form-texts.model';
import { ProductFormToastTexts } from './models/product-form-toast-texts.model';
import { ProductFormVariation } from './models/product-form-variation.model';

@Component({
  selector: 'app-product-form',
  imports: [
    ProductFormAttributes,
    ProductFormBasicInfo,
    ProductFormCategories,
    ProductFormImages,
    ProductFormPricingInventory,
    ProductFormTags,
    ProductFormVariations,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  readonly productForm = input.required<any>();
  readonly texts = input.required<ProductFormTexts>();
  readonly toastTexts = input.required<ProductFormToastTexts>();
  readonly fieldIds = input.required<ProductFormFieldIds>();
  readonly statusOptions = input.required<DropdownOption[]>();
  readonly productTypeOptions = input.required<RadioGroupOption[]>();
  readonly productTypeSimple = input.required<ProductType>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialSelectedCategoryIds = input<Set<string>>(new Set());
  readonly initialAssignedAttributes = input<ProductFormAssignedAttribute[]>([]);
  readonly initialAssignedTags = input<ProductFormAssignedTag[]>([]);
  readonly initialImages = input<ProductFormImageItem[]>([]);
  readonly initialVariations = input<ProductFormVariation[]>([]);

  readonly productTypeChange = output<ProductType>();

  protected readonly shouldShowPricingInventory = computed(
    () => this.productForm().type().value() !== ProductType.Variable,
  );
  protected readonly shouldShowVariations = computed(
    () => this.productForm().type().value() === ProductType.Variable,
  );

  protected onProductTypeOptionChange(value: string | number | boolean): void {
    if (value !== ProductType.Simple && value !== ProductType.Variable) {
      return;
    }

    this.productTypeChange.emit(value);
  }
}
