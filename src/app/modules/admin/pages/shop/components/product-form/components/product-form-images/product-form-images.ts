import { Component, effect, inject, input, untracked } from '@angular/core';
import { ProductFormImageItem } from '../../models/product-form-image-item.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormSharedImages } from '../product-form-shared-images/product-form-shared-images';
import { ProductImagesToastTexts } from './models/product-images-toast-texts.model';
import { ProductImagesService } from './services/product-images.service';

@Component({
  selector: 'app-product-form-images',
  imports: [ProductFormSharedImages],
  providers: [ProductImagesService],
  templateUrl: './product-form-images.html',
  styleUrl: './product-form-images.scss',
})
export class ProductFormImages {
  private readonly imagesService = inject(ProductImagesService);

  readonly texts = input.required<ProductFormTexts>();
  readonly toastTexts = input.required<ProductImagesToastTexts>();
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialImages = input<ProductFormImageItem[]>([]);

  protected readonly images = this.imagesService.images;
  protected readonly isUploadLoading = this.imagesService.isImageUploadLoading;

  constructor() {
    this.imagesService.configure(
      {
        getShopId: () => null,
        getProductId: () => this.productId(),
        isSidebarEnabled: () => !this.sidebarDisabled(),
      },
      () => this.toastTexts(),
    );

    effect(() => {
      const initialImages = this.initialImages();
      untracked(() => this.imagesService.setImages(initialImages));
    });
  }

  protected onFilesSelected(files: File[]): void {
    this.imagesService.onImageFilesSelected(files);
  }

  protected onMoveUp(imageId: string): void {
    this.imagesService.onImageMoveUp(imageId);
  }

  protected onMoveDown(imageId: string): void {
    this.imagesService.onImageMoveDown(imageId);
  }

  protected onRemove(imageId: string): void {
    this.imagesService.onImageRemove(imageId);
  }

  protected onUpload(): void {
    this.imagesService.uploadImages();
  }
}
