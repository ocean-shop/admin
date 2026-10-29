import { Component, effect, inject, input, untracked } from '@angular/core';
import { PRODUCT_FORM_VARIATIONS_ICON } from '../../constants/product-form.constants';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormVariationFieldChange } from '../../models/product-form-variation-field-change.model';
import { ProductFormVariation } from '../../models/product-form-variation.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { ProductFormVariationCard } from './components/product-form-variation-card/product-form-variation-card';
import { ProductVariationsService } from './services/product-variations.service';

@Component({
  selector: 'app-product-form-variations',
  imports: [ProductFormCard, ProductFormVariationCard],
  providers: [ProductVariationsService],
  templateUrl: './product-form-variations.html',
  styleUrl: './product-form-variations.scss',
})
export class ProductFormVariations {
  private readonly variationsService = inject(ProductVariationsService);

  readonly texts = input.required<ProductFormTexts>();
  readonly shopId = input<string | null>(null);
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialVariations = input<ProductFormVariation[]>([]);

  protected readonly icon = PRODUCT_FORM_VARIATIONS_ICON;
  protected readonly variations = this.variationsService.variations;

  constructor() {
    this.variationsService.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.productId(),
      isSidebarEnabled: () => !this.sidebarDisabled(),
    });

    // Seeds the service whenever the page loads a (new) product.
    effect(() => {
      const initialVariations = this.initialVariations();
      untracked(() => this.variationsService.setVariations(initialVariations));
    });
  }

  protected onAdd(): void {
    this.variationsService.onVariationAdd();
  }

  protected onSave(localId: string): void {
    this.variationsService.saveVariation({ localId });
  }

  protected onRemove(localId: string): void {
    this.variationsService.onVariationRemove({ localId });
  }

  protected onFieldChange(localId: string, change: ProductFormVariationFieldChange): void {
    this.variationsService.onVariationChange({ localId, ...change });
  }

  protected onAttributeSearchChange(localId: string, value: string): void {
    this.variationsService.onVariationAttributeSearchChange({ localId, value });
  }

  protected onAttributeAssign(localId: string, attributeId: string): void {
    this.variationsService.onVariationAttributeAssign({ localId, attributeId });
  }

  protected onAttributeUnassign(localId: string, attributeId: string): void {
    this.variationsService.onVariationAttributeUnassign({ localId, attributeId });
  }

  protected onImageFilesSelected(localId: string, files: File[]): void {
    this.variationsService.onVariationImageFilesSelected({ localId, files });
  }

  protected onImageMoveUp(localId: string, imageId: string): void {
    this.variationsService.onVariationImageMoveUp({ localId, imageId });
  }

  protected onImageMoveDown(localId: string, imageId: string): void {
    this.variationsService.onVariationImageMoveDown({ localId, imageId });
  }

  protected onImageRemove(localId: string, imageId: string): void {
    this.variationsService.onVariationImageRemove({ localId, imageId });
  }
}
