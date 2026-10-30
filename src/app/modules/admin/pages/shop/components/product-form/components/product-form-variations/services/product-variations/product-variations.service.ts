import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { moveItemByOffset } from '@core/helpers/array/array.helper';
import { createDebouncedScheduler } from '@core/helpers/debounced-scheduler/debounced-scheduler.helper';
import {
  filterAllowedImageFiles,
  mapFilesToImageItems,
} from '@core/helpers/image-file/image-file.helper';
import { PRODUCT_VARIATION_IMAGE_ID_PREFIX } from '../../../../../../constants/product-api-mapping.constants';
import { mapAttributeSearchResults } from '../../../../../../helpers/product-search-results/product-search-results.helper';
import { createEmptyProductFormVariation } from '../../../../../../helpers/product-variation-mapping/product-variation-mapping.helper';
import { AttributeApiItem } from '../../../../../../pages/attributes/models/attribute.model';
import {
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_TOAST_TEXTS,
  PRODUCT_FORM_VARIATION_LOCAL_ID_PREFIX,
} from '../../../../constants/product-form.constants';
import { ImageSortOffset } from '../../../../models/image-sort-offset.type';
import { ProductFormVariationAttributeSearchEvent } from '../../../../models/product-form-variation-attribute-search-event.model';
import { ProductFormVariationAttributeToggleEvent } from '../../../../models/product-form-variation-attribute-toggle-event.model';
import { ProductFormVariationChangeEvent } from '../../../../models/product-form-variation-change-event.model';
import { ProductFormVariationCreateEvent } from '../../../../models/product-form-variation-create-event.model';
import { ProductFormVariationImageFilesEvent } from '../../../../models/product-form-variation-image-files-event.model';
import { ProductFormVariationImageToggleEvent } from '../../../../models/product-form-variation-image-toggle-event.model';
import { ProductFormVariationImage } from '../../../../models/product-form-variation-image.model';
import { ProductFormVariationRemoveEvent } from '../../../../models/product-form-variation-remove-event.model';
import { ProductFormVariation } from '../../../../models/product-form-variation.model';
import { ProductFormSearchService } from '../../../../services/product-form-search/product-form-search.service';
import { ProductFormSectionService } from '../../../../services/product-form-section/product-form-section.service';
import {
  buildCreateVariationPayload,
  buildUpdateVariationPayload,
  resolveSavedVariationId,
} from '../../helpers/product-variation-payload/product-variation-payload.helper';
import {
  assignVariationAttribute,
  updateVariationByLocalId,
} from '../../helpers/product-variation-state/product-variation-state.helper';
import { SaveProductVariationMutationPayload } from '../../models/save-product-variation-mutation-payload.model';

/**
 * Local editing of the product variations; every variation is saved on its own.
 * The attribute search is debounced per variation (keyed by its local id).
 */
@Injectable()
export class ProductVariationsService extends ProductFormSectionService {
  private readonly searchService = inject(ProductFormSearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly attributeSearchScheduler = createDebouncedScheduler(
    PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  );

  readonly variations = signal<ProductFormVariation[]>([]);

  private readonly saveVariationMutation = injectMutation(() => ({
    mutationFn: ({ productId, variation }: SaveProductVariationMutationPayload) =>
      lastValueFrom(
        variation.id
          ? this.productsService.updateVariation(
              productId,
              variation.id,
              buildUpdateVariationPayload(variation),
            )
          : this.productsService.createVariation(productId, buildCreateVariationPayload(variation)),
      ),
  }));

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.attributeSearchScheduler.cancelAll());
  }

  setVariations(variations: ProductFormVariation[]): void {
    this.attributeSearchScheduler.cancelAll();
    this.variations.set(variations);
  }

  onVariationAdd(): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const localId = `${PRODUCT_FORM_VARIATION_LOCAL_ID_PREFIX}-${crypto.randomUUID()}`;
    this.variations.update((variations) => [
      ...variations,
      createEmptyProductFormVariation(localId),
    ]);
  }

  onVariationRemove(event: ProductFormVariationRemoveEvent): void {
    const localId = this.resolveEditableId(event.localId);
    if (!localId) {
      return;
    }

    this.attributeSearchScheduler.cancel(localId);
    this.variations.update((variations) =>
      variations.filter((variation) => variation.localId !== localId),
    );
  }

  onVariationChange({ localId: rawLocalId, field, value }: ProductFormVariationChangeEvent): void {
    const localId = this.resolveEditableId(rawLocalId);
    if (localId) {
      this.updateVariation(localId, (variation) => ({ ...variation, [field]: value }));
    }
  }

  onVariationAttributeSearchChange(event: ProductFormVariationAttributeSearchEvent): void {
    const localId = event.localId.trim();
    if (!localId) {
      return;
    }

    this.updateVariation(localId, (variation) => ({
      ...variation,
      attributeSearchValue: event.value,
    }));
    this.queueAttributeSearch(localId);
  }

  onVariationAttributeAssign(event: ProductFormVariationAttributeToggleEvent): void {
    const localId = this.resolveEditableId(event.localId);
    const attributeId = event.attributeId.trim();
    if (localId && attributeId) {
      this.updateVariation(localId, (variation) =>
        assignVariationAttribute(variation, attributeId),
      );
    }
  }

  onVariationAttributeUnassign(event: ProductFormVariationAttributeToggleEvent): void {
    const localId = this.resolveEditableId(event.localId);
    const attributeId = event.attributeId.trim();
    if (!localId || !attributeId) {
      return;
    }

    this.updateVariation(localId, (variation) => ({
      ...variation,
      attributes: variation.attributes.filter((attribute) => attribute.id !== attributeId),
    }));
  }

  onVariationImageFilesSelected(event: ProductFormVariationImageFilesEvent): void {
    const localId = this.resolveEditableId(event.localId);
    const imageFiles = filterAllowedImageFiles(event.files);
    if (!localId || !imageFiles.length) {
      return;
    }

    void mapFilesToImageItems(imageFiles, PRODUCT_VARIATION_IMAGE_ID_PREFIX).then((images) =>
      this.updateVariationImages(localId, (current) => [...current, ...images]),
    );
  }

  onVariationImageMoveUp(event: ProductFormVariationImageToggleEvent): void {
    this.moveVariationImage(event, -1);
  }

  onVariationImageMoveDown(event: ProductFormVariationImageToggleEvent): void {
    this.moveVariationImage(event, 1);
  }

  onVariationImageRemove(event: ProductFormVariationImageToggleEvent): void {
    const localId = this.resolveEditableId(event.localId);
    const imageId = event.imageId.trim();
    if (localId && imageId) {
      this.updateVariationImages(localId, (images) =>
        images.filter((image) => image.id !== imageId),
      );
    }
  }

  saveVariation(event: ProductFormVariationCreateEvent): void {
    const productId = this.getProductId();
    const localId = this.resolveEditableId(event.localId);
    const variation = this.variations().find((item) => item.localId === localId);
    if (!productId || !localId || !variation || variation.isSaving) {
      return;
    }

    this.setVariationSaving(localId, true);
    this.saveVariationMutation.mutate(
      { productId, variation },
      {
        onSuccess: (product) => {
          this.invalidateProductQueries(productId);
          const savedId = resolveSavedVariationId(product.variations ?? [], variation);
          this.updateVariation(localId, (current) => ({ ...current, id: savedId ?? current.id }));
          this.toasterService.success(PRODUCT_FORM_TOAST_TEXTS.VARIATION_SAVE_SUCCESS_TITLE);
        },
        onSettled: () => this.setVariationSaving(localId, false),
      },
    );
  }

  private queueAttributeSearch(localId: string): void {
    const shopId = this.getShopId();
    const variation = this.variations().find((item) => item.localId === localId);
    const name = variation?.attributeSearchValue.trim();
    if (!shopId || !name) {
      this.attributeSearchScheduler.cancel(localId);
      this.updateVariation(localId, (current) => ({
        ...current,
        isAttributeSearchLoading: false,
        attributeSearchResults: [],
      }));
      return;
    }

    this.attributeSearchScheduler.schedule(localId, (isLatest) =>
      this.loadAttributeSearchResults(localId, shopId, name, isLatest),
    );
  }

  private loadAttributeSearchResults(
    localId: string,
    shopId: string,
    name: string,
    isLatest: () => boolean,
  ): void {
    this.updateVariation(localId, (variation) => ({
      ...variation,
      isAttributeSearchLoading: true,
    }));

    void this.searchService
      .searchAttributes(shopId, name)
      .catch((): AttributeApiItem[] => [])
      .then((items) => {
        if (!isLatest()) {
          return;
        }

        this.updateVariation(localId, (variation) => ({
          ...variation,
          attributeSearchResults: mapAttributeSearchResults(items, variation.attributes),
          isAttributeSearchLoading: false,
        }));
      });
  }

  private moveVariationImage(
    event: ProductFormVariationImageToggleEvent,
    offset: ImageSortOffset,
  ): void {
    const localId = this.resolveEditableId(event.localId);
    const imageId = event.imageId.trim();
    if (localId && imageId) {
      this.updateVariationImages(localId, (images) =>
        moveItemByOffset(images, (image) => image.id === imageId, offset),
      );
    }
  }

  private updateVariationImages(
    localId: string,
    update: (images: ProductFormVariationImage[]) => ProductFormVariationImage[],
  ): void {
    this.updateVariation(localId, (variation) => ({
      ...variation,
      images: update(variation.images),
    }));
  }

  private setVariationSaving(localId: string, isSaving: boolean): void {
    this.updateVariation(localId, (variation) => ({ ...variation, isSaving }));
  }

  private updateVariation(
    localId: string,
    update: (variation: ProductFormVariation) => ProductFormVariation,
  ): void {
    this.variations.update((variations) => updateVariationByLocalId(variations, localId, update));
  }

  /** Trimmed local id, or null when it is blank or the sidebar is read-only. */
  private resolveEditableId(rawLocalId: string): string | null {
    return this.isSidebarEnabled() ? rawLocalId.trim() || null : null;
  }
}
