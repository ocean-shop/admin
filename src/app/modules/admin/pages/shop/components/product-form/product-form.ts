import { Component, computed, input } from '@angular/core';
import { ProductType } from '../../pages/products/models/product-type.enum';
import { ProductFormAttributes } from './components/product-form-attributes/product-form-attributes';
import { ProductFormBasicInfo } from './components/product-form-basic-info/product-form-basic-info';
import { ProductFormCategories } from './components/product-form-categories/product-form-categories';
import { ProductFormImages } from './components/product-form-images/product-form-images';
import { ProductFormPricingInventory } from './components/product-form-pricing-inventory/product-form-pricing-inventory';
import { ProductFormSeo } from './components/product-form-seo/product-form-seo';
import { ProductFormTags } from './components/product-form-tags/product-form-tags';
import { ProductFormVariations } from './components/product-form-variations/product-form-variations';
import {
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
  PRODUCT_FORM_TEXTS,
  PRODUCT_FORM_TYPE_OPTIONS,
} from './constants/product-form.constants';
import { ProductFormAssignedAttribute } from './models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from './models/product-form-assigned-tag.model';
import { ProductFormImageItem } from './models/product-form-image-item.model';
import { ProductFormTree } from './models/product-form-tree.model';
import { ProductFormVariation } from './models/product-form-variation.model';

/**
 * Product editor shared by the create and update pages. The main column edits the
 * page-owned form; sidebar sections save themselves once the product exists.
 */
@Component({
  selector: 'app-product-form',
  imports: [
    ProductFormAttributes,
    ProductFormBasicInfo,
    ProductFormCategories,
    ProductFormImages,
    ProductFormPricingInventory,
    ProductFormSeo,
    ProductFormTags,
    ProductFormVariations,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  readonly productForm = input.required<ProductFormTree>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialSelectedCategoryIds = input<Set<string>>(new Set());
  readonly initialAssignedAttributes = input<ProductFormAssignedAttribute[]>([]);
  readonly initialAssignedTags = input<ProductFormAssignedTag[]>([]);
  readonly initialImages = input<ProductFormImageItem[]>([]);
  readonly initialVariations = input<ProductFormVariation[]>([]);

  protected readonly texts = PRODUCT_FORM_TEXTS;
  protected readonly fieldIds = PRODUCT_FORM_FIELD_IDS;
  protected readonly statusOptions = PRODUCT_FORM_STATUS_OPTIONS;
  protected readonly productTypeOptions = PRODUCT_FORM_TYPE_OPTIONS;

  protected readonly isVariable = computed(
    () => this.productForm().type().value() === ProductType.Variable,
  );
}
