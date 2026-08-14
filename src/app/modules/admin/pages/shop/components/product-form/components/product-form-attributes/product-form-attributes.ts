import { Component, effect, inject, input, untracked } from '@angular/core';
import { ProductFormAssignedAttribute } from '../../models/product-form-assigned-attribute.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormSharedAttributes } from '../product-form-shared-attributes/product-form-shared-attributes';
import { ProductAttributesToastTexts } from './models/product-attributes-toast-texts.model';
import { ProductAttributesService } from './services/product-attributes.service';

@Component({
  selector: 'app-product-form-attributes',
  imports: [ProductFormSharedAttributes],
  providers: [ProductAttributesService],
  templateUrl: './product-form-attributes.html',
  styleUrl: './product-form-attributes.scss',
})
export class ProductFormAttributes {
  private readonly attributesService = inject(ProductAttributesService);

  readonly texts = input.required<ProductFormTexts>();
  readonly toastTexts = input.required<ProductAttributesToastTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialAssignedAttributes = input<ProductFormAssignedAttribute[]>([]);

  protected readonly attributeSearchValue = this.attributesService.attributeSearchValue;
  protected readonly isAttributeSearchLoading = this.attributesService.isAttributeSearchLoading;
  protected readonly attributeSearchResults = this.attributesService.attributeSearchResults;
  protected readonly assignedAttributes = this.attributesService.assignedAttributes;

  constructor() {
    this.attributesService.configure(
      {
        getShopId: () => this.shopId(),
        getProductId: () => this.productId(),
        isSidebarEnabled: () => !this.sidebarDisabled(),
      },
      () => this.toastTexts(),
    );

    effect(() => {
      const assignedAttributes = this.initialAssignedAttributes();
      untracked(() => this.attributesService.setAssignedAttributes(assignedAttributes));
    });
  }

  protected onAttributeSearchChange(value: string): void {
    this.attributesService.onAttributeSearchChange(value);
  }

  protected onAttributeAssign(attributeId: string): void {
    this.attributesService.onAttributeAssign(attributeId);
  }

  protected onAttributeUnassign(attributeId: string): void {
    this.attributesService.onAttributeUnassign(attributeId);
  }
}
