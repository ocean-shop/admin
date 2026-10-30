import { Component, effect, inject, input, untracked } from '@angular/core';
import { PRODUCT_FORM_IMAGES_ICON } from '../../constants/product-form.constants';
import { ProductFormImageItem } from '../../models/product-form-image-item.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormCard } from '../product-form-card/product-form-card';
import { ProductFormSharedImages } from '../product-form-shared-images/product-form-shared-images';
import { ProductImagesService } from './services/product-images/product-images.service';

@Component({
  selector: 'app-product-form-images',
  imports: [ProductFormCard, ProductFormSharedImages],
  providers: [ProductImagesService],
  templateUrl: './product-form-images.html',
  styleUrl: './product-form-images.scss',
})
export class ProductFormImages {
  private readonly imagesService = inject(ProductImagesService);

  readonly texts = input.required<ProductFormTexts>();
  readonly productId = input<string | null>(null);
  readonly sidebarDisabled = input<boolean>(false);
  readonly initialImages = input<ProductFormImageItem[]>([]);

  protected readonly icon = PRODUCT_FORM_IMAGES_ICON;
  protected readonly images = this.imagesService.images;
  protected readonly isUploadLoading = this.imagesService.isImageUploadLoading;

  constructor() {
    this.imagesService.configure({
      getShopId: () => null,
      getProductId: () => this.productId(),
      isSidebarEnabled: () => !this.sidebarDisabled(),
    });

    // Seeds the gallery whenever the page loads a (new) product.
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
