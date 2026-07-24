import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { finalize } from 'rxjs';
import { ProductFormAssignedAttribute } from '../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from '../components/product-form/models/product-form-attribute-option.model';
import { ProductFormCategoryNode } from '../components/product-form/models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../components/product-form/models/product-form-category-toggle-event.model';
import { ProductFormImageItem } from '../components/product-form/models/product-form-image-item.model';
import { ProductFormTagOption } from '../components/product-form/models/product-form-tag-option.model';
import { extractCategoriesFromResponse } from '../helpers/categories-response.helper';
import {
  buildProductCategoryTreeNodes,
  updateSelectedCategoryIds,
} from '../helpers/product-category-tree.helper';
import { ProductEditorContext } from '../helpers/models/product-editor-context.model';
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

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearAttributeSearchDebounce();
      this.clearTagSearchDebounce();
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
    this.clearAttributeSearchDebounce();
    this.clearTagSearchDebounce();
    this.attributeSearchRequestId = 0;
    this.tagSearchRequestId = 0;
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
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    this.images.update((currentImages) => this.moveImageByOffset(currentImages, imageId, -1));
  }

  onImageMoveDown(imageId: string): void {
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    this.images.update((currentImages) => this.moveImageByOffset(currentImages, imageId, 1));
  }

  onImageRemove(imageId: string): void {
    if (!this.isSidebarEnabled() || this.isImageUploadLoading()) {
      return;
    }

    this.images.update((currentImages) =>
      currentImages.filter((image) => image.id !== imageId.trim()),
    );
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
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isImageUploadLoading.set(false)),
      )
      .subscribe({
        next: () => {
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

  private clearAttributeSearchDebounce(): void {
    if (this.attributeSearchDebounceTimer) {
      clearTimeout(this.attributeSearchDebounceTimer);
      this.attributeSearchDebounceTimer = null;
    }
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
}
