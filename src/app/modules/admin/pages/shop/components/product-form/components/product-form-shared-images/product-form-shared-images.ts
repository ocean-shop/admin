import { Component, input, output } from '@angular/core';
import { ProductFormImageListItem } from '../../models/product-form-image-list-item.model';

@Component({
  selector: 'app-product-form-shared-images',
  templateUrl: './product-form-shared-images.html',
  styleUrl: './product-form-shared-images.scss',
})
export class ProductFormSharedImages {
  readonly interactionDisabled = input<boolean>(false);
  readonly images = input<ProductFormImageListItem[]>([]);
  readonly dropzoneHint = input.required<string>();
  readonly emptyStateText = input.required<string>();
  readonly allowDrop = input<boolean>(false);
  readonly compactDropzone = input<boolean>(false);

  readonly filesSelected = output<File[]>();
  readonly moveUp = output<string>();
  readonly moveDown = output<string>();
  readonly remove = output<string>();

  protected onFileInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const files = this.extractImageFiles(inputElement?.files);
    if (inputElement) {
      inputElement.value = '';
    }

    if (!files.length || this.interactionDisabled()) {
      return;
    }

    this.filesSelected.emit(files);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.allowDrop() || this.interactionDisabled()) {
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
    if (this.interactionDisabled()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.moveUp.emit(normalizedImageId);
  }

  protected onMoveDown(imageId: string): void {
    if (this.interactionDisabled()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.moveDown.emit(normalizedImageId);
  }

  protected onRemove(imageId: string): void {
    if (this.interactionDisabled()) {
      return;
    }

    const normalizedImageId = imageId.trim();
    if (!normalizedImageId) {
      return;
    }

    this.remove.emit(normalizedImageId);
  }

  private extractImageFiles(fileList: FileList | null | undefined): File[] {
    if (!fileList?.length) {
      return [];
    }

    return Array.from(fileList).filter((file) => file.type.startsWith('image/'));
  }
}
