import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { SHOP_QUERY_KEYS } from '../../../../../constants/shop-query-keys.constants';
import { parseProductPrice } from '../../../../../helpers/product-price.helper';
import { AttributesService } from '../../../../../pages/attributes/services/attributes.service';
import {
  PRODUCT_FORM_DEFAULT_VARIATION_ATTRIBUTE_LABEL,
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_SEARCH_QUERY_LIMIT,
  PRODUCT_FORM_SEARCH_QUERY_PAGE,
  PRODUCT_FORM_UUID_PATTERN,
} from '../../../constants/product-form.constants';
import { CreateProductVariationPayload } from '../../../../../pages/products/models/create-product-variation-payload.model';
import { UpdateProductVariationPayload } from '../../../../../pages/products/models/update-product-variation-payload.model';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormAttributeOption } from '../../../models/product-form-attribute-option.model';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductFormVariationAttributeSearchEvent } from '../../../models/product-form-variation-attribute-search-event.model';
import { ProductFormVariationAttributeToggleEvent } from '../../../models/product-form-variation-attribute-toggle-event.model';
import { ProductFormVariationChangeEvent } from '../../../models/product-form-variation-change-event.model';
import { ProductFormVariationCreateEvent } from '../../../models/product-form-variation-create-event.model';
import { ProductFormVariationImageFilesEvent } from '../../../models/product-form-variation-image-files-event.model';
import { ProductFormVariationImageToggleEvent } from '../../../models/product-form-variation-image-toggle-event.model';
import { ProductFormVariationRemoveEvent } from '../../../models/product-form-variation-remove-event.model';
import { ProductFormVariation } from '../../../models/product-form-variation.model';
import { ProductVariationApiReference } from '../models/product-variation-api-reference.model';
import { SaveProductVariationMutationPayload } from '../models/save-product-variation-mutation-payload.model';
import { ProductVariationsToastTexts } from '../models/product-variations-toast-texts.model';

@Injectable()
export class ProductVariationsService {
  private readonly productsService = inject(ProductsService);
  private readonly attributesService = inject(AttributesService);
  private readonly queryClient = injectQueryClient();
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  private context: ProductFormEditorContext | null = null;
  private getToastTexts: () => ProductVariationsToastTexts = () => {
    throw new Error('ProductVariationsService is not configured.');
  };
  private attributeSearchDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private attributeSearchRequestIds = new Map<string, number>();
  private nextVariationId = 0;

  readonly variations = signal<ProductFormVariation[]>([]);

  private readonly saveVariationMutation = injectMutation(() => ({
    mutationFn: ({ productId, variation }: SaveProductVariationMutationPayload) =>
      variation.id
        ? lastValueFrom(
            this.productsService.updateVariation(
              productId,
              variation.id,
              this.buildUpdateVariationPayload(variation),
            ),
          )
        : lastValueFrom(
            this.productsService.createVariation(
              productId,
              this.buildCreateVariationPayload(variation),
            ),
          ),
  }));

  constructor() {
    this.destroyRef.onDestroy(() => this.clearAllAttributeSearchDebounces());
  }

  configure(
    context: ProductFormEditorContext,
    getToastTexts: () => ProductVariationsToastTexts,
  ): void {
    this.context = context;
    this.getToastTexts = getToastTexts;
  }

  setVariations(variations: ProductFormVariation[]): void {
    this.clearAllAttributeSearchDebounces();
    this.attributeSearchRequestIds.clear();
    this.nextVariationId = 0;
    this.variations.set(variations);
  }

  onVariationAdd(): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    this.variations.update((currentVariations) => [
      ...currentVariations,
      this.createDefaultVariation(),
    ]);
  }

  onVariationRemove(event: ProductFormVariationRemoveEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    this.clearAttributeSearchDebounce(normalizedLocalId);
    this.attributeSearchRequestIds.delete(normalizedLocalId);
    this.variations.update((currentVariations) =>
      currentVariations.filter((variation) => variation.localId !== normalizedLocalId),
    );
  }

  onVariationChange(event: ProductFormVariationChangeEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === normalizedLocalId
          ? {
              ...variation,
              [event.field]: event.value,
            }
          : variation,
      ),
    );
  }

  onVariationAttributeSearchChange(event: ProductFormVariationAttributeSearchEvent): void {
    const normalizedLocalId = event.localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    const nextValue = event.value;
    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === normalizedLocalId
          ? {
              ...variation,
              attributeSearchValue: nextValue,
            }
          : variation,
      ),
    );

    this.queueAttributeSearch(normalizedLocalId);
  }

  onVariationAttributeAssign(event: ProductFormVariationAttributeToggleEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    const normalizedAttributeId = event.attributeId.trim();
    if (!normalizedLocalId || !normalizedAttributeId) {
      return;
    }

    this.variations.update((currentVariations) =>
      currentVariations.map((variation) => {
        if (variation.localId !== normalizedLocalId) {
          return variation;
        }

        const selectedOption = variation.attributeSearchResults.find(
          (option) => option.id === normalizedAttributeId,
        );
        if (!selectedOption) {
          return variation;
        }

        const [namePart, ...valueParts] = selectedOption.label.split(':');
        const name = namePart.trim();
        const value = valueParts.join(':').trim() || selectedOption.label.trim();
        const existingAttribute = variation.attributes.find(
          (attribute) => attribute.id === normalizedAttributeId,
        );
        const nextAttribute = {
          id: normalizedAttributeId,
          attributeTypeId: normalizedAttributeId,
          name: name || selectedOption.label.trim(),
          value,
          label: selectedOption.label,
        };
        const nextAttributes = existingAttribute
          ? variation.attributes.map((attribute) =>
              attribute.id === normalizedAttributeId ? nextAttribute : attribute,
            )
          : [...variation.attributes, nextAttribute];
        return {
          ...variation,
          attributes: nextAttributes,
          attributeSearchValue: '',
          attributeSearchResults: [],
        };
      }),
    );
  }

  onVariationAttributeUnassign(event: ProductFormVariationAttributeToggleEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    const normalizedAttributeId = event.attributeId.trim();
    if (!normalizedLocalId || !normalizedAttributeId) {
      return;
    }

    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === normalizedLocalId
          ? {
              ...variation,
              attributes: variation.attributes.filter(
                (attribute) => attribute.id !== normalizedAttributeId,
              ),
            }
          : variation,
      ),
    );
  }

  onVariationImageFilesSelected(event: ProductFormVariationImageFilesEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    if (!normalizedLocalId) {
      return;
    }

    const imageFiles = event.files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
      return;
    }

    void this.appendImageFiles(normalizedLocalId, imageFiles);
  }

  onVariationImageMoveUp(event: ProductFormVariationImageToggleEvent): void {
    this.moveImageByOffset(event, -1);
  }

  onVariationImageMoveDown(event: ProductFormVariationImageToggleEvent): void {
    this.moveImageByOffset(event, 1);
  }

  onVariationImageRemove(event: ProductFormVariationImageToggleEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    const normalizedImageId = event.imageId.trim();
    if (!normalizedLocalId || !normalizedImageId) {
      return;
    }

    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === normalizedLocalId
          ? {
              ...variation,
              images: variation.images.filter((image) => image.id !== normalizedImageId),
            }
          : variation,
      ),
    );
  }

  saveVariation(event: ProductFormVariationCreateEvent): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const productId = this.getProductId();
    const normalizedLocalId = event.localId.trim();
    if (!productId || !normalizedLocalId) {
      return;
    }

    const targetVariation = this.variations().find(
      (variation) => variation.localId === normalizedLocalId,
    );
    if (!targetVariation || targetVariation.isSaving) {
      return;
    }

    this.setVariationSaving(normalizedLocalId, true);

    this.saveVariationMutation.mutate(
      { productId, variation: targetVariation },
      {
        onSuccess: (product) => {
          this.invalidateProductQueries(productId);
          const savedVariation = this.findSavedVariation(product.variations ?? [], targetVariation);
          const persistedId =
            typeof savedVariation === 'string' ? savedVariation : savedVariation?.id;
          this.variations.update((currentVariations) =>
            currentVariations.map((variation) =>
              variation.localId === normalizedLocalId
                ? {
                    ...variation,
                    id: String(persistedId ?? '').trim() || variation.id,
                  }
                : variation,
            ),
          );
          this.toasterService.success(this.getToastTexts().VARIATION_SAVE_SUCCESS_TITLE);
        },
        onError: () => {
          this.toasterService.danger(
            this.getToastTexts().VARIATION_SAVE_ERROR_TITLE,
            this.getToastTexts().VARIATION_SAVE_ERROR_MESSAGE,
          );
        },
        onSettled: () => {
          this.setVariationSaving(normalizedLocalId, false);
        },
      },
    );
  }

  private queueAttributeSearch(localId: string): void {
    this.clearAttributeSearchDebounce(localId);

    const shopId = this.getShopId();
    const variation = this.variations().find((item) => item.localId === localId);
    const searchName = variation?.attributeSearchValue.trim() ?? '';
    if (!shopId || !variation || !searchName) {
      this.variations.update((currentVariations) =>
        currentVariations.map((item) =>
          item.localId === localId
            ? {
                ...item,
                isAttributeSearchLoading: false,
                attributeSearchResults: [],
              }
            : item,
        ),
      );
      return;
    }

    const timer = setTimeout(() => {
      this.loadAttributeSearchResults(localId, shopId, searchName);
    }, PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
    this.attributeSearchDebounceTimers.set(localId, timer);
  }

  private clearAttributeSearchDebounce(localId: string): void {
    const existingTimer = this.attributeSearchDebounceTimers.get(localId);
    if (!existingTimer) {
      return;
    }

    clearTimeout(existingTimer);
    this.attributeSearchDebounceTimers.delete(localId);
  }

  private clearAllAttributeSearchDebounces(): void {
    this.attributeSearchDebounceTimers.forEach((timer) => clearTimeout(timer));
    this.attributeSearchDebounceTimers.clear();
  }

  private loadAttributeSearchResults(localId: string, shopId: string, name: string): void {
    const requestId = (this.attributeSearchRequestIds.get(localId) ?? 0) + 1;
    this.attributeSearchRequestIds.set(localId, requestId);
    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === localId
          ? {
              ...variation,
              isAttributeSearchLoading: true,
            }
          : variation,
      ),
    );

    this.queryClient
      .fetchQuery({
        queryKey: SHOP_QUERY_KEYS.attributesSearch(shopId, name),
        queryFn: () =>
          lastValueFrom(
            this.attributesService.getAttributes({
              page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
              limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
              shopId,
              name,
            }),
          ),
      })
      .then((response) => {
        if ((this.attributeSearchRequestIds.get(localId) ?? 0) !== requestId) {
          return;
        }

        this.variations.update((currentVariations) =>
          currentVariations.map((variation) => {
            if (variation.localId !== localId) {
              return variation;
            }

            const assignedAttributeIds = new Set(variation.attributes.map((item) => item.id));
            const attributeSearchResults = response.items.reduce<ProductFormAttributeOption[]>(
              (accumulator, item) => {
                const id = String(item.id ?? '').trim();
                if (!id || assignedAttributeIds.has(id)) {
                  return accumulator;
                }

                const labelName =
                  item.name?.trim() || PRODUCT_FORM_DEFAULT_VARIATION_ATTRIBUTE_LABEL;
                const labelValue = item.value?.trim() || '';
                const label = labelValue ? `${labelName}: ${labelValue}` : labelName;
                return [...accumulator, { id, label }];
              },
              [],
            );
            return {
              ...variation,
              attributeSearchResults,
            };
          }),
        );
      })
      .catch(() => {
        if ((this.attributeSearchRequestIds.get(localId) ?? 0) !== requestId) {
          return;
        }

        this.variations.update((currentVariations) =>
          currentVariations.map((variation) =>
            variation.localId === localId
              ? {
                  ...variation,
                  attributeSearchResults: [],
                }
              : variation,
          ),
        );
      })
      .finally(() => {
        if ((this.attributeSearchRequestIds.get(localId) ?? 0) !== requestId) {
          return;
        }

        this.variations.update((currentVariations) =>
          currentVariations.map((variation) =>
            variation.localId === localId
              ? {
                  ...variation,
                  isAttributeSearchLoading: false,
                }
              : variation,
          ),
        );
      });
  }

  private moveImageByOffset(event: ProductFormVariationImageToggleEvent, offset: -1 | 1): void {
    if (!this.isSidebarEnabled()) {
      return;
    }

    const normalizedLocalId = event.localId.trim();
    const normalizedImageId = event.imageId.trim();
    if (!normalizedLocalId || !normalizedImageId) {
      return;
    }

    this.variations.update((currentVariations) =>
      currentVariations.map((variation) => {
        if (variation.localId !== normalizedLocalId) {
          return variation;
        }

        const currentIndex = variation.images.findIndex((image) => image.id === normalizedImageId);
        if (currentIndex < 0) {
          return variation;
        }

        const targetIndex = currentIndex + offset;
        if (targetIndex < 0 || targetIndex >= variation.images.length) {
          return variation;
        }

        const nextImages = [...variation.images];
        const currentItem = nextImages[currentIndex];
        nextImages[currentIndex] = nextImages[targetIndex];
        nextImages[targetIndex] = currentItem;
        return {
          ...variation,
          images: nextImages,
        };
      }),
    );
  }

  private createDefaultVariation(): ProductFormVariation {
    this.nextVariationId += 1;
    const localId = `variation-local-${Date.now()}-${this.nextVariationId}`;
    return {
      localId,
      id: null,
      title: '',
      name: '',
      price: '',
      oldPrice: '',
      sku: '',
      available: true,
      isMain: false,
      attributes: [],
      attributeSearchValue: '',
      attributeSearchResults: [],
      isAttributeSearchLoading: false,
      images: [],
      isSaving: false,
    };
  }

  private setVariationSaving(localId: string, isSaving: boolean): void {
    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === localId
          ? {
              ...variation,
              isSaving,
            }
          : variation,
      ),
    );
  }

  private buildCreateVariationPayload(
    variation: ProductFormVariation,
  ): CreateProductVariationPayload {
    return {
      variation: 'product_variations',
      ...this.buildVariationCommonPayload(variation),
      attributes: variation.attributes
        .map((attribute) => ({
          attributeTypeId: attribute.attributeTypeId.trim(),
        }))
        .filter((attribute) => this.isUuid(attribute.attributeTypeId)),
      images: variation.images.map((image, index) => ({
        image: image.imageDataUrl,
        sort: index,
      })),
    };
  }

  private buildUpdateVariationPayload(
    variation: ProductFormVariation,
  ): UpdateProductVariationPayload {
    return {
      ...this.buildVariationCommonPayload(variation),
      attributes: variation.attributes
        .map((attribute) => ({
          attributeTypeId: attribute.attributeTypeId.trim(),
        }))
        .filter((attribute) => this.isUuid(attribute.attributeTypeId)),
      images: variation.images.map((image, index) => ({
        image: image.imageDataUrl,
        sort: index,
      })),
    };
  }

  private buildVariationCommonPayload(
    variation: ProductFormVariation,
  ): Pick<
    UpdateProductVariationPayload,
    'title' | 'name' | 'sku' | 'price' | 'oldPrice' | 'available' | 'isDefault'
  > {
    const price = parseProductPrice(variation.price);
    const oldPrice = parseProductPrice(variation.oldPrice);

    return {
      title: variation.title.trim() || undefined,
      name: variation.name.trim() || undefined,
      sku: variation.sku.trim() || undefined,
      ...(price !== null ? { price } : {}),
      oldPrice,
      available: variation.available,
      isDefault: variation.isMain,
    };
  }

  private isUuid(value: string): boolean {
    return PRODUCT_FORM_UUID_PATTERN.test(value);
  }

  private findSavedVariation(
    apiVariations: ProductVariationApiReference[],
    targetVariation: ProductFormVariation,
  ): ProductVariationApiReference | null {
    if (!apiVariations.length) {
      return null;
    }

    const byId = apiVariations.find(
      (variation) =>
        typeof variation !== 'string' &&
        targetVariation.id &&
        String(variation.id ?? '').trim() === targetVariation.id,
    );
    if (byId) {
      return byId;
    }

    const normalizedSku = targetVariation.sku.trim();
    if (normalizedSku) {
      const bySku = apiVariations.find((variation) => {
        if (typeof variation === 'string') {
          return false;
        }

        return String(variation.sku ?? '').trim() === normalizedSku;
      });
      if (bySku) {
        return bySku;
      }
    }

    const lastVariation = apiVariations[apiVariations.length - 1];
    return lastVariation ?? null;
  }

  private async appendImageFiles(localId: string, imageFiles: File[]): Promise<void> {
    const mappedImages = await this.mapFilesToImageItems(localId, imageFiles);
    if (!mappedImages.length) {
      return;
    }

    this.variations.update((currentVariations) =>
      currentVariations.map((variation) =>
        variation.localId === localId
          ? {
              ...variation,
              images: [...variation.images, ...mappedImages],
            }
          : variation,
      ),
    );
  }

  private async mapFilesToImageItems(
    localId: string,
    imageFiles: File[],
  ): Promise<ProductFormVariation['images']> {
    const mappedItems = await Promise.all(
      imageFiles.map(async (file, index) => ({
        id: this.createImageId(localId, file, index),
        name: file.name.trim() || `variation-image-${Date.now()}-${index + 1}`,
        imageDataUrl: await this.readFileAsDataUrl(file),
      })),
    );

    return mappedItems.filter((item) => item.imageDataUrl.startsWith('data:image/'));
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  }

  private createImageId(localId: string, file: File, index: number): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    const namePart = file.name.trim().replace(/\s+/g, '-').toLowerCase() || 'variation-image';
    return `${localId}-${namePart}-${Date.now()}-${index}-${randomPart}`;
  }

  private getShopId(): string | null {
    return this.requireContext().getShopId()?.trim() || null;
  }

  private getProductId(): string | null {
    return this.requireContext().getProductId()?.trim() || null;
  }

  private invalidateProductQueries(productId: string): void {
    this.queryClient.invalidateQueries({
      queryKey: SHOP_QUERY_KEYS.productById(productId),
    });

    const shopId = this.getShopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: ['shop', shopId, 'products'],
    });
  }

  private isSidebarEnabled(): boolean {
    return this.requireContext().isSidebarEnabled();
  }

  private requireContext(): ProductFormEditorContext {
    if (!this.context) {
      throw new Error('ProductVariationsService is not configured.');
    }

    return this.context;
  }
}
