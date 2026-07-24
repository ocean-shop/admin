import { Component, input, output } from '@angular/core';
import { ProductFormImageItem } from '../../models/product-form-image-item.model';
import { ProductFormTexts } from '../../models/product-form-texts.model';

@Component({
  selector: 'app-product-form-images',
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

  protected onFileInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const files = this.extractImageFiles(inputElement?.files);
    if (!files.length || this.isInteractionBlocked()) {
      if (inputElement) {
        inputElement.value = '';
      }
      return;
    }

    this.filesSelected.emit(files);
    if (inputElement) {
      inputElement.value = '';
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isInteractionBlocked()) {
      return;
    }

    const files = this.extractImageFiles(event.dataTransfer?.files);
    if (!files.length) {
      return;
    }

    this.filesSelected.emit(files);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
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

  private extractImageFiles(fileList: FileList | null | undefined): File[] {
    if (!fileList?.length) {
      return [];
    }

    return Array.from(fileList).filter((file) => file.type.startsWith('image/'));
  }
}
