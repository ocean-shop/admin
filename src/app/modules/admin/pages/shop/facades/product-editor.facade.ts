import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { finalize, switchMap } from 'rxjs';
import { ProductFormAssignedAttribute } from '../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from '../components/product-form/models/product-form-attribute-option.model';
import { ProductFormCategoryNode } from '../components/product-form/models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../components/product-form/models/product-form-category-toggle-event.model';
import { ProductFormImageItem } from '../components/product-form/models/product-form-image-item.model';
import { ProductFormTagOption } from '../components/product-form/models/product-form-tag-option.model';
import { ProductFormVariationAttributeSearchEvent } from '../components/product-form/models/product-form-variation-attribute-search-event.model';
import { ProductFormVariationAttributeToggleEvent } from '../components/product-form/models/product-form-variation-attribute-toggle-event.model';
import { ProductFormVariationChangeEvent } from '../components/product-form/models/product-form-variation-change-event.model';
import { ProductFormVariationCreateEvent } from '../components/product-form/models/product-form-variation-create-event.model';
import { ProductFormVariationImageFilesEvent } from '../components/product-form/models/product-form-variation-image-files-event.model';
import { ProductFormVariationImageToggleEvent } from '../components/product-form/models/product-form-variation-image-toggle-event.model';
import { ProductFormVariationRemoveEvent } from '../components/product-form/models/product-form-variation-remove-event.model';
import { ProductFormVariation } from '../components/product-form/models/product-form-variation.model';
import { extractCategoriesFromResponse } from '../helpers/categories-response.helper';
import { extractProductImages } from '../helpers/product-api-mapping.helper';
import {
  buildProductCategoryTreeNodes,
  updateSelectedCategoryIds,
} from '../helpers/product-category-tree.helper';
import { ProductEditorContext } from '../helpers/models/product-editor-context.model';
import { parseProductPrice } from '../helpers/product-price.helper';
import {
  mapAttributeSearchResults,
  mapTagSearchResults,
  removeAssignedAttribute,
  removeAssignedTag,
  upsertAssignedAttribute,
  upsertAssignedTag,
} from '../helpers/product-search-results.helper';
import { AttributesService } from '../pages/attributes/services/attributes.service';
import { CategoryApiItem } from '../pages/categories/models/category.model';
import { CategoriesService } from '../pages/categories/services/categories.service';
import { CreateProductVariationPayload } from '../pages/products/models/create-product-variation-payload.model';
import { UpdateProductVariationPayload } from '../pages/products/models/update-product-variation-payload.model';
import { ProductsService } from '../pages/products/services/products.service';
import { TagsService } from '../pages/tags/services/tags.service';

@Injectable()
export class ProductEditorFacade {
  private readonly productsService = inject(ProductsService);
  private readonly attributesService = inject(AttributesService);
  private readonly tagsService = inject(TagsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  private context: ProductEditorContext | null = null;
  private attributeSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private attributeSearchRequestId = 0;
  private tagSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private tagSearchRequestId = 0;
  private variationAttributeSearchDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private variationAttributeSearchRequestIds = new Map<string, number>();
  private nextVariationId = 0;

  readonly isCategoriesLoading = signal(false);
  readonly isCategoryToggleLoading = signal(false);
  readonly isAttributeSearchLoading = signal(false);
  readonly isAttributeToggleLoading = signal(false);
  readonly isTagSearchLoading = signal(false);
  readonly isTagToggleLoading = signal(false);
  readonly isImageUploadLoading = signal(false);
  readonly categoryItems = signal<CategoryApiItem[]>([]);
  readonly selectedCategoryIds = signal<Set<string>>(new Set());
  readonly attributeSearchValue = signal('');
  readonly attributeSearchResults = signal<ProductFormAttributeOption[]>([]);
  readonly assignedAttributes = signal<ProductFormAssignedAttribute[]>([]);
  readonly tagSearchValue = signal('');
  readonly tagSearchResults = signal<ProductFormTagOption[]>([]);
  readonly assignedTags = signal<ProductFormAssignedTag[]>([]);
  readonly images = signal<ProductFormImageItem[]>([]);
  readonly variations = signal<ProductFormVariation[]>([]);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearAttributeSearchDebounce();
      this.clearTagSearchDebounce();
      this.clearAllVariationAttributeSearchDebounces();
    });
  }

  configure(context: ProductEditorContext): void {
    this.context = context;
  }

  resetState(options?: { clearCategories?: boolean }): void {
    this.selectedCategoryIds.set(new Set());
    this.assignedAttributes.set([]);
    this.assignedTags.set([]);
    this.images.set([]);
    this.attributeSearchValue.set('');
    this.attributeSearchResults.set([]);
    this.tagSearchValue.set('');
    this.tagSearchResults.set([]);
    this.isImageUploadLoading.set(false);
    this.variations.set([]);
    this.clearAttributeSearchDebounce();
    this.clearTagSearchDebounce();
    this.clearAllVariationAttributeSearchDebounces();
    this.attributeSearchRequestId = 0;
    this.tagSearchRequestId = 0;
    this.variationAttributeSearchRequestIds.clear();
    this.nextVariationId = 0;
    if (options?.clearCategories) {
      this.categoryItems.set([]);
    }
  }

  loadCategories(): void {
    const shopId = this.getShopId();
    if (!shopId) {
      this.categoryItems.set([]);
      return;
    }

    this.isCategoriesLoading.set(true);
    this.categoriesService
      .getCategories(shopId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCategoriesLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.categoryItems.set(extractCategoriesFromResponse(response));
        },
        error: () => {
          this.categoryItems.set([]);
          this.toasterService.danger(
            this.requireContext().texts.CATEGORIES_LOAD_ERROR_TITLE,
            this.requireContext().texts.CATEGORIES_LOAD_ERROR_MESSAGE,
          );
        },
      });
  }

  buildCategoryNodes(options?: { disabled?: boolean }): ProductFormCategoryNode[] {
    return buildProductCategoryTreeNodes(this.categoryItems(), this.selectedCategoryIds(), options);
  }

  onCategoryToggle(event: ProductFormCategoryToggleEvent): void {
    if (!this.isSidebarEnabled() || this.isCategoryToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const categoryId = event.categoryId.trim();
    if (!categoryId) {
      return;
    }

    this.selectedCategoryIds.update((currentValue) =>
      updateSelectedCategoryIds(currentValue, categoryId, event.checked),
    );

    this.isCategoryToggleLoading.set(true);
    this.productsService
      .toggleCategory(productId, { categoryId, assign: event.checked })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCategoryToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(
            event.checked
              ? this.requireContext().texts.CATEGORY_ASSIGN_SUCCESS_TITLE
              : this.requireContext().texts.CATEGORY_UNASSIGN_SUCCESS_TITLE,
          );
        },
        error: () => {
          this.selectedCategoryIds.update((currentValue) =>
            updateSelectedCategoryIds(currentValue, categoryId, !event.checked),
          );
          this.toasterService.danger(
            this.requireContext().texts.CATEGORY_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.CATEGORY_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  onAttributeSearchChange(value: string): void {
    this.attributeSearchValue.set(value);
    if (!this.isSidebarEnabled()) {
      this.attributeSearchResults.set([]);
      return;
    }

    this.queueAttributeSearch();
  }

  onAttributeAssign(attributeId: string): void {
    if (!this.isSidebarEnabled() || this.isAttributeToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const selectedOption = this.attributeSearchResults().find(
      (option) => option.id === attributeId,
    );
    if (!selectedOption) {
      return;
    }

    this.isAttributeToggleLoading.set(true);
    this.productsService
      .toggleAttribute(productId, { attributeTypeId: attributeId, assign: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAttributeToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedAttributes.update((currentValue) =>
            upsertAssignedAttribute(currentValue, selectedOption),
          );
          this.attributeSearchValue.set('');
          this.attributeSearchResults.set([]);
          this.toasterService.success(this.requireContext().texts.ATTRIBUTE_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.ATTRIBUTE_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  onAttributeUnassign(attributeId: string): void {
    if (!this.isSidebarEnabled() || this.isAttributeToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    this.isAttributeToggleLoading.set(true);
    this.productsService
      .toggleAttribute(productId, { attributeTypeId: attributeId, assign: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAttributeToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedAttributes.update((currentValue) =>
            removeAssignedAttribute(currentValue, attributeId),
          );
          this.toasterService.success(this.requireContext().texts.ATTRIBUTE_UNASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.ATTRIBUTE_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  onTagSearchChange(value: string): void {
    this.tagSearchValue.set(value);
    if (!this.isSidebarEnabled()) {
      this.tagSearchResults.set([]);
      return;
    }

    this.queueTagSearch();
  }

  onTagAssign(tagId: string): void {
    if (!this.isSidebarEnabled() || this.isTagToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const selectedOption = this.tagSearchResults().find((option) => option.id === tagId);
    if (!selectedOption) {
      return;
    }

    this.isTagToggleLoading.set(true);
    this.productsService
      .toggleTag(productId, { tagId, assign: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isTagToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedTags.update((currentValue) =>
            upsertAssignedTag(currentValue, selectedOption),
          );
          this.tagSearchValue.set('');
          this.tagSearchResults.set([]);
          this.toasterService.success(this.requireContext().texts.TAG_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.TAG_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  onTagUnassign(tagId: string): void {
    if (!this.isSidebarEnabled() || this.isTagToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    this.isTagToggleLoading.set(true);
    this.productsService
      .toggleTag(productId, { tagId, assign: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isTagToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedTags.update((currentValue) => removeAssignedTag(currentValue, tagId));
          this.toasterService.success(this.requireContext().texts.TAG_UNASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.TAG_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  onImageFilesSelected(files: File[]): void {
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) {
      return;
    }

    void this.appendImageFiles(imageFiles);
  }

  onImageMoveUp(imageId: string): void {
    this.changeImageSort(imageId, 'up', -1);
  }

  onImageMoveDown(imageId: string): void {
    this.changeImageSort(imageId, 'down', 1);
  }

  onImageRemove(imageId: string): void {
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.isImageUploadLoading.set(true);
    this.productsService
      .removeImage(normalizedImageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isImageUploadLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.images.update((currentImages) =>
            currentImages.filter((image) => image.id !== normalizedImageId),
          );
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.IMAGES_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.IMAGES_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  uploadImages(): void {
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const images = this.images();
    if (!images.length) {
      return;
    }

    this.isImageUploadLoading.set(true);
    this.productsService
      .assignImages(productId, {
        images: images.map((image, index) => ({ image: image.imageDataUrl, sort: index })),
      })
      .pipe(
        switchMap(() => this.productsService.getProductById(productId)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isImageUploadLoading.set(false)),
      )
      .subscribe({
        next: (product) => {
          this.images.set(extractProductImages(product));
          this.toasterService.success(this.requireContext().texts.IMAGES_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.IMAGES_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.IMAGES_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
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

    this.clearVariationAttributeSearchDebounce(normalizedLocalId);
    this.variationAttributeSearchRequestIds.delete(normalizedLocalId);
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

    this.queueVariationAttributeSearch(normalizedLocalId);
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

    void this.appendVariationImageFiles(normalizedLocalId, imageFiles);
  }

  onVariationImageMoveUp(event: ProductFormVariationImageToggleEvent): void {
    this.moveVariationImageByOffset(event, -1);
  }

  onVariationImageMoveDown(event: ProductFormVariationImageToggleEvent): void {
    this.moveVariationImageByOffset(event, 1);
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

    const request$ = targetVariation.id
      ? this.productsService.updateVariation(
          productId,
          targetVariation.id,
          this.buildUpdateVariationPayload(targetVariation),
        )
      : this.productsService.createVariation(
          productId,
          this.buildCreateVariationPayload(targetVariation),
        );

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.setVariationSaving(normalizedLocalId, false)),
      )
      .subscribe({
        next: (product) => {
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
          this.toasterService.success(this.requireContext().texts.VARIATION_SAVE_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.VARIATION_SAVE_ERROR_TITLE,
            this.requireContext().texts.VARIATION_SAVE_ERROR_MESSAGE,
          );
        },
      });
  }

  private queueAttributeSearch(): void {
    this.clearAttributeSearchDebounce();

    const shopId = this.getShopId();
    const searchName = this.attributeSearchValue().trim();
    if (!shopId || !searchName) {
      this.isAttributeSearchLoading.set(false);
      this.attributeSearchResults.set([]);
      return;
    }

    this.attributeSearchDebounceTimer = setTimeout(() => {
      this.loadAttributeSearchResults(shopId, searchName);
    }, 300);
  }

  private queueVariationAttributeSearch(localId: string): void {
    this.clearVariationAttributeSearchDebounce(localId);

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
      this.loadVariationAttributeSearchResults(localId, shopId, searchName);
    }, 300);
    this.variationAttributeSearchDebounceTimers.set(localId, timer);
  }

  private clearAttributeSearchDebounce(): void {
    if (this.attributeSearchDebounceTimer) {
      clearTimeout(this.attributeSearchDebounceTimer);
      this.attributeSearchDebounceTimer = null;
    }
  }

  private clearVariationAttributeSearchDebounce(localId: string): void {
    const existingTimer = this.variationAttributeSearchDebounceTimers.get(localId);
    if (!existingTimer) {
      return;
    }

    clearTimeout(existingTimer);
    this.variationAttributeSearchDebounceTimers.delete(localId);
  }

  private clearAllVariationAttributeSearchDebounces(): void {
    this.variationAttributeSearchDebounceTimers.forEach((timer) => clearTimeout(timer));
    this.variationAttributeSearchDebounceTimers.clear();
  }

  private queueTagSearch(): void {
    this.clearTagSearchDebounce();

    const shopId = this.getShopId();
    const searchName = this.tagSearchValue().trim();
    if (!shopId || !searchName) {
      this.isTagSearchLoading.set(false);
      this.tagSearchResults.set([]);
      return;
    }

    this.tagSearchDebounceTimer = setTimeout(() => {
      this.loadTagSearchResults(shopId, searchName);
    }, 300);
  }

  private clearTagSearchDebounce(): void {
    if (this.tagSearchDebounceTimer) {
      clearTimeout(this.tagSearchDebounceTimer);
      this.tagSearchDebounceTimer = null;
    }
  }

  private loadAttributeSearchResults(shopId: string, name: string): void {
    const requestId = ++this.attributeSearchRequestId;
    this.isAttributeSearchLoading.set(true);

    this.attributesService
      .getAttributes({
        page: 1,
        limit: 20,
        shopId,
        name,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.attributeSearchRequestId) {
            this.isAttributeSearchLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.attributeSearchRequestId) {
            return;
          }

          this.attributeSearchResults.set(
            mapAttributeSearchResults(response.items, this.assignedAttributes()),
          );
        },
        error: () => {
          if (requestId !== this.attributeSearchRequestId) {
            return;
          }

          this.attributeSearchResults.set([]);
        },
      });
  }

  private loadVariationAttributeSearchResults(localId: string, shopId: string, name: string): void {
    const requestId = (this.variationAttributeSearchRequestIds.get(localId) ?? 0) + 1;
    this.variationAttributeSearchRequestIds.set(localId, requestId);
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

    this.attributesService
      .getAttributes({
        page: 1,
        limit: 20,
        shopId,
        name,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if ((this.variationAttributeSearchRequestIds.get(localId) ?? 0) !== requestId) {
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
        }),
      )
      .subscribe({
        next: (response) => {
          if ((this.variationAttributeSearchRequestIds.get(localId) ?? 0) !== requestId) {
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

                  const labelName = item.name?.trim() || 'Атрибут';
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
        },
        error: () => {
          if ((this.variationAttributeSearchRequestIds.get(localId) ?? 0) !== requestId) {
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
        },
      });
  }

  private loadTagSearchResults(shopId: string, name: string): void {
    const requestId = ++this.tagSearchRequestId;
    this.isTagSearchLoading.set(true);

    this.tagsService
      .getTags({
        page: 1,
        limit: 20,
        shopId,
        name,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.tagSearchRequestId) {
            this.isTagSearchLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.tagSearchRequestId) {
            return;
          }

          this.tagSearchResults.set(mapTagSearchResults(response.items, this.assignedTags()));
        },
        error: () => {
          if (requestId !== this.tagSearchRequestId) {
            return;
          }

          this.tagSearchResults.set([]);
        },
      });
  }

  private getShopId(): string | null {
    const context = this.context;
    return context?.getShopId()?.trim() || null;
  }

  private getProductId(): string | null {
    const context = this.context;
    return context?.getProductId()?.trim() || null;
  }

  private isSidebarEnabled(): boolean {
    const context = this.requireContext();
    return context.isSidebarEnabled ? context.isSidebarEnabled() : true;
  }

  private requireContext(): ProductEditorContext {
    if (!this.context) {
      throw new Error('ProductEditorFacade is not configured.');
    }

    return this.context;
  }

  private async appendImageFiles(imageFiles: File[]): Promise<void> {
    const mappedImages = await this.mapFilesToImageItems(imageFiles);
    if (!mappedImages.length) {
      return;
    }

    this.images.update((currentImages) => [...currentImages, ...mappedImages]);
  }

  private async mapFilesToImageItems(imageFiles: File[]): Promise<ProductFormImageItem[]> {
    const mappedItems = await Promise.all(
      imageFiles.map(async (file, index) => ({
        id: this.createImageId(file, index),
        name: file.name.trim() || `image-${Date.now()}-${index + 1}`,
        imageDataUrl: await this.readFileAsDataUrl(file),
      })),
    );

    return mappedItems.filter((item) => item.imageDataUrl.startsWith('data:image/'));
  }

  private changeImageSort(imageId: string, direction: 'up' | 'down', offset: -1 | 1): void {
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.isImageUploadLoading.set(true);
    this.productsService
      .changeImageSort(normalizedImageId, { direction })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isImageUploadLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.images.update((currentImages) =>
            this.moveImageByOffset(currentImages, normalizedImageId, offset),
          );
        },
        error: () => {
          this.toasterService.danger(
            this.requireContext().texts.IMAGES_ASSIGN_ERROR_TITLE,
            this.requireContext().texts.IMAGES_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  private moveImageByOffset(
    images: ProductFormImageItem[],
    imageId: string,
    offset: -1 | 1,
  ): ProductFormImageItem[] {
    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return images;
    }

    const currentIndex = images.findIndex((image) => image.id === normalizedImageId);
    if (currentIndex < 0) {
      return images;
    }

    const targetIndex = currentIndex + offset;
    if (targetIndex < 0 || targetIndex >= images.length) {
      return images;
    }

    const nextImages = [...images];
    const currentItem = nextImages[currentIndex];
    nextImages[currentIndex] = nextImages[targetIndex];
    nextImages[targetIndex] = currentItem;

    return nextImages;
  }

  private moveVariationImageByOffset(
    event: ProductFormVariationImageToggleEvent,
    offset: -1 | 1,
  ): void {
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
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  private findSavedVariation(
    apiVariations: ({ id?: string | null; sku?: string | null } | string)[],
    targetVariation: ProductFormVariation,
  ): { id?: string | null; sku?: string | null } | string | null {
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

  private async appendVariationImageFiles(localId: string, imageFiles: File[]): Promise<void> {
    const mappedImages = await this.mapFilesToVariationImageItems(localId, imageFiles);
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

  private async mapFilesToVariationImageItems(
    localId: string,
    imageFiles: File[],
  ): Promise<ProductFormVariation['images']> {
    const mappedItems = await Promise.all(
      imageFiles.map(async (file, index) => ({
        id: this.createVariationImageId(localId, file, index),
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

  private createImageId(file: File, index: number): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    const namePart = file.name.trim().replace(/\s+/g, '-').toLowerCase() || 'image';
    return `${namePart}-${Date.now()}-${index}-${randomPart}`;
  }

  private createVariationImageId(localId: string, file: File, index: number): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    const namePart = file.name.trim().replace(/\s+/g, '-').toLowerCase() || 'variation-image';
    return `${localId}-${namePart}-${Date.now()}-${index}-${randomPart}`;
  }
}
