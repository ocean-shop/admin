import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable, switchMap } from 'rxjs';
import { moveItemByOffset } from '@core/helpers/array/array.helper';
import {
  filterAllowedImageFiles,
  mapFilesToImageItems,
  mapImagesToSortPayload,
} from '@core/helpers/image-file/image-file.helper';
import { extractProductImages } from '../../../../../../helpers/product-api-mapping/product-api-mapping.helper';
import { ChangeProductImageSortPayload } from '../../../../../../pages/products/models/change-product-image-sort-payload.model';
import {
  PRODUCT_FORM_IMAGE_ID_PREFIX,
  PRODUCT_FORM_TOAST_TEXTS,
} from '../../../../constants/product-form.constants';
import { ImageSortOffset } from '../../../../models/image-sort-offset.type';
import { ProductFormImageItem } from '../../../../models/product-form-image-item.model';
import { ProductFormSectionService } from '../../../../services/product-form-section/product-form-section.service';

@Injectable()
export class ProductImagesService extends ProductFormSectionService {
  private readonly destroyRef = inject(DestroyRef);

  readonly images = signal<ProductFormImageItem[]>([]);
  readonly isImageUploadLoading = signal(false);

  setImages(images: ProductFormImageItem[]): void {
    this.images.set(images);
    this.isImageUploadLoading.set(false);
  }

  onImageFilesSelected(files: File[]): void {
    const imageFiles = filterAllowedImageFiles(files);
    if (!this.canInteract() || !imageFiles.length) {
      return;
    }

    void mapFilesToImageItems(imageFiles, PRODUCT_FORM_IMAGE_ID_PREFIX).then((items) =>
      this.images.update((current) => [...current, ...items]),
    );
  }

  onImageMoveUp(imageId: string): void {
    this.changeImageSort(imageId, 'up', -1);
  }

  onImageMoveDown(imageId: string): void {
    this.changeImageSort(imageId, 'down', 1);
  }

  onImageRemove(imageId: string): void {
    const id = imageId.trim();
    if (!id || !this.canInteract()) {
      return;
    }

    this.runImageRequest(this.productsService.removeImage(id), () =>
      this.images.update((current) => current.filter((image) => image.id !== id)),
    );
  }

  /** Replaces the product gallery with the local list (order = sort) and reloads it from the API. */
  uploadImages(): void {
    const productId = this.getProductId();
    const images = this.images();
    if (!productId || !images.length || !this.canInteract()) {
      return;
    }

    const request$ = this.productsService
      .assignImages(productId, { images: mapImagesToSortPayload(images) })
      .pipe(switchMap(() => this.productsService.getProductById(productId)));

    this.runImageRequest(request$, (product) => {
      this.images.set(extractProductImages(product));
      this.toasterService.success(PRODUCT_FORM_TOAST_TEXTS.IMAGES_ASSIGN_SUCCESS_TITLE);
    });
  }

  private changeImageSort(
    imageId: string,
    direction: ChangeProductImageSortPayload['direction'],
    offset: ImageSortOffset,
  ): void {
    const id = imageId.trim();
    if (!id || !this.canInteract()) {
      return;
    }

    this.runImageRequest(this.productsService.changeImageSort(id, { direction }), () =>
      this.images.update((current) =>
        moveItemByOffset(current, (image) => image.id === id, offset),
      ),
    );
  }

  private runImageRequest<T>(request$: Observable<T>, onSuccess: (response: T) => void): void {
    this.isImageUploadLoading.set(true);
    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isImageUploadLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          const productId = this.getProductId();
          if (productId) {
            this.invalidateProductQueries(productId);
          }
          onSuccess(response);
        },
        // Failures are toasted by the global error interceptor.
        error: () => undefined,
      });
  }

  private canInteract(): boolean {
    return this.isSidebarEnabled() && !this.isImageUploadLoading();
  }
}
