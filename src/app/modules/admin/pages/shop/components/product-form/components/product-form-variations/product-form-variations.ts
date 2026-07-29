import { Component, effect, inject, input, untracked } from '@angular/core';
import { Checkbox } from '@ui/checkbox/checkbox';
import { Input } from '@ui/input/input';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormVariationChangeEvent } from '../../models/product-form-variation-change-event.model';
import { ProductFormVariation } from '../../models/product-form-variation.model';
import { ProductFormSharedAttributes } from '../product-form-shared-attributes/product-form-shared-attributes';
import { ProductFormSharedImages } from '../product-form-shared-images/product-form-shared-images';
import { ProductVariationsToastTexts } from './models/product-variations-toast-texts.model';
import { ProductVariationsService } from './services/product-variations.service';

@Component({
  selector: 'app-product-form-variations',
  imports: [Checkbox, Input, ProductFormSharedAttributes, ProductFormSharedImages],
  providers: [ProductVariationsService],
  templateUrl: './product-form-variations.html',
  styleUrl: './product-form-variations.scss',
})
export class ProductFormVariations {
  private readonly variationsService = inject(ProductVariationsService);

  readonly texts = input.required<ProductFormTexts>();
  readonly toastTexts = input.required<ProductVariationsToastTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialVariations = input<ProductFormVariation[]>([]);

  protected readonly variations = this.variationsService.variations;

  constructor() {
    this.variationsService.configure(
      {
        getShopId: () => this.shopId(),
        getProductId: () => this.productId(),
        isSidebarEnabled: () => !this.sidebarDisabled(),
      },
      () => this.toastTexts(),
    );

    effect(() => {
      const initialVariations = this.initialVariations();
      untracked(() => this.variationsService.setVariations(initialVariations));
    });
  }

  protected onVariationAdd(): void {
    this.variationsService.onVariationAdd();
  }

  protected onVariationCreate(localId: string): void {
    this.variationsService.saveVariation({ localId });
  }

  protected onVariationRemove(localId: string): void {
    this.variationsService.onVariationRemove({ localId });
  }

  protected onVariationFieldChange(
    localId: string,
    field: ProductFormVariationChangeEvent['field'],
    value: string | boolean,
  ): void {
    this.variationsService.onVariationChange({ localId, field, value });
  }

  protected onVariationAttributeSearchChange(localId: string, value: string): void {
    this.variationsService.onVariationAttributeSearchChange({ localId, value });
  }

  protected onVariationAttributeAssign(localId: string, attributeId: string): void {
    this.variationsService.onVariationAttributeAssign({ localId, attributeId });
  }

  protected onVariationAttributeUnassign(localId: string, attributeId: string): void {
    this.variationsService.onVariationAttributeUnassign({ localId, attributeId });
  }

  protected onVariationImageFilesSelected(localId: string, files: File[]): void {
    this.variationsService.onVariationImageFilesSelected({ localId, files });
  }

  protected onVariationImageMoveUp(localId: string, imageId: string): void {
    this.variationsService.onVariationImageMoveUp({ localId, imageId });
  }

  protected onVariationImageMoveDown(localId: string, imageId: string): void {
    this.variationsService.onVariationImageMoveDown({ localId, imageId });
  }

  protected onVariationImageRemove(localId: string, imageId: string): void {
    this.variationsService.onVariationImageRemove({ localId, imageId });
  }
}
