import { Component, effect, inject, input, untracked } from '@angular/core';
import {
  PRODUCT_FORM_ATTRIBUTES_ICON,
  PRODUCT_FORM_ATTRIBUTES_SEARCH_ID,
} from '../../constants/product-form.constants';
import { ProductFormAssignedAttribute } from '../../models/product-form-assigned-attribute.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { ProductFormSharedAttributes } from '../product-form-shared-attributes/product-form-shared-attributes';
import { ProductAttributesService } from './services/product-attributes.service';

@Component({
  selector: 'app-product-form-attributes',
  imports: [ProductFormCard, ProductFormSharedAttributes],
  providers: [ProductAttributesService],
  templateUrl: './product-form-attributes.html',
})
export class ProductFormAttributes {
  private readonly attributesService = inject(ProductAttributesService);

  readonly texts = input.required<ProductFormTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialAssignedAttributes = input<ProductFormAssignedAttribute[]>([]);

  protected readonly icon = PRODUCT_FORM_ATTRIBUTES_ICON;
  protected readonly inputId = PRODUCT_FORM_ATTRIBUTES_SEARCH_ID;
  protected readonly searchValue = this.attributesService.searchValue;
  protected readonly isSearchLoading = this.attributesService.isSearchLoading;
  protected readonly searchResults = this.attributesService.searchResults;
  protected readonly assignedAttributes = this.attributesService.assignedItems;

  constructor() {
    this.attributesService.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.productId(),
      isSidebarEnabled: () => !this.sidebarDisabled(),
    });

    // Seeds the service whenever the page loads a (new) product.
    effect(() => {
      const assignedAttributes = this.initialAssignedAttributes();
      untracked(() => this.attributesService.setAssignedItems(assignedAttributes));
    });
  }

  protected onSearchChange(value: string): void {
    this.attributesService.onSearchChange(value);
  }

  protected onAssign(attributeId: string): void {
    this.attributesService.onAssign(attributeId);
  }

  protected onUnassign(attributeId: string): void {
    this.attributesService.onUnassign(attributeId);
  }
}
