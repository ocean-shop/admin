import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { extractProductImages } from '../../../../../helpers/product-api-mapping.helper';
import { ChangeProductImageSortPayload } from '../../../../../pages/products/models/change-product-image-sort-payload.model';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductFormImageItem } from '../../../models/product-form-image-item.model';
import { ImageSortOffset } from '../models/image-sort-offset.type';
import { ProductImagesToastTexts } from '../models/product-images-toast-texts.model';

@Injectable()
export class ProductImagesService {
  private readonly productsService = inject(ProductsService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  private context: ProductFormEditorContext | null = null;
  private getToastTexts: () => ProductImagesToastTexts = () => {
    throw new Error('ProductImagesService is not configured.');
  };

  readonly images = signal<ProductFormImageItem[]>([]);
  readonly isImageUploadLoading = signal(false);

  configure(context: ProductFormEditorContext, getToastTexts: () => ProductImagesToastTexts): void {
    this.context = context;
    this.getToastTexts = getToastTexts;
  }

  setImages(images: ProductFormImageItem[]): void {
    this.images.set(images);
    this.isImageUploadLoading.set(false);
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
            this.getToastTexts().IMAGES_ASSIGN_ERROR_TITLE,
            this.getToastTexts().IMAGES_ASSIGN_ERROR_MESSAGE,
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
          this.toasterService.success(this.getToastTexts().IMAGES_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.getToastTexts().IMAGES_ASSIGN_ERROR_TITLE,
            this.getToastTexts().IMAGES_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
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

  private changeImageSort(
    imageId: string,
    direction: ChangeProductImageSortPayload['direction'],
    offset: ImageSortOffset,
  ): void {
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
            this.getToastTexts().IMAGES_ASSIGN_ERROR_TITLE,
            this.getToastTexts().IMAGES_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  private moveImageByOffset(
    images: ProductFormImageItem[],
    imageId: string,
    offset: ImageSortOffset,
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

  private getProductId(): string | null {
    return this.requireContext().getProductId()?.trim() || null;
  }

  private isSidebarEnabled(): boolean {
    return this.requireContext().isSidebarEnabled();
  }

  private requireContext(): ProductFormEditorContext {
    if (!this.context) {
      throw new Error('ProductImagesService is not configured.');
    }

    return this.context;
  }
}
