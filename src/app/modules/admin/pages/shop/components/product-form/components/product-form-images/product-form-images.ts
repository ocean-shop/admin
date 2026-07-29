import { Component, input, output } from '@angular/core';
import { ProductFormImageItem } from '../../models/product-form-image-item.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';
import { ProductFormSharedImages } from '../product-form-shared-images/product-form-shared-images';

@Component({
  selector: 'app-product-form-images',
  imports: [ProductFormSharedImages],
  templateUrl: './product-form-images.html',
  styleUrl: './product-form-images.scss',
})
export class ProductFormImages {
  readonly texts = input.required<ProductFormTexts>();
  readonly sidebarDisabled = input<boolean>(false);
  readonly images = input<ProductFormImageItem[]>([]);
  readonly isUploadLoading = input<boolean>(false);

  readonly filesSelected = output<File[]>();
  readonly moveUp = output<string>();
  readonly moveDown = output<string>();
  readonly remove = output<string>();
  readonly upload = output<void>();

  protected onFilesSelected(files: File[]): void {
    if (!files.length || this.isInteractionBlocked()) {
      return;
    }

    this.filesSelected.emit(files);
  }

  protected onMoveUp(imageId: string): void {
    if (this.isInteractionBlocked()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.moveUp.emit(normalizedImageId);
  }

  protected onMoveDown(imageId: string): void {
    if (this.isInteractionBlocked()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.moveDown.emit(normalizedImageId);
  }

  protected onRemove(imageId: string): void {
    if (this.isInteractionBlocked()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.remove.emit(normalizedImageId);
  }

  protected onUpload(): void {
    if (this.isInteractionBlocked() || !this.images().length) {
      return;
    }

    this.upload.emit();
  }

  private isInteractionBlocked(): boolean {
    return this.sidebarDisabled() || this.isUploadLoading();
  }
}
