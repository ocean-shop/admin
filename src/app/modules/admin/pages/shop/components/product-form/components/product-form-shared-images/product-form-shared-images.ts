import { Component, input, output, OutputEmitterRef } from '@angular/core';
import { IMAGE_UPLOAD_ACCEPT } from '@core/constants/image-upload.constants';
import { filterAllowedImageFiles } from '@core/helpers/image-file.helper';
import {
  PRODUCT_FORM_IMAGE_ICONS,
  PRODUCT_FORM_TEXTS,
} from '../../constants/product-form.constants';
import { ProductFormImageListItem } from '../../models/product-form-image-list-item.model';

/** Dropzone + ordered image list shared by the product gallery and the variation images. */
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
  readonly imageSubTitle = input.required<string>();
  readonly allowDrop = input<boolean>(false);
  readonly compactDropzone = input<boolean>(false);

  readonly filesSelected = output<File[]>();
  readonly moveUp = output<string>();
  readonly moveDown = output<string>();
  readonly remove = output<string>();

  protected readonly accept = IMAGE_UPLOAD_ACCEPT;
  protected readonly icons = PRODUCT_FORM_IMAGE_ICONS;
  protected readonly texts = PRODUCT_FORM_TEXTS;

  protected onFileInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    const files = filterAllowedImageFiles(inputElement?.files);
    if (inputElement) {
      inputElement.value = '';
    }

    this.emitFiles(files);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.allowDrop()) {
      this.emitFiles(filterAllowedImageFiles(event.dataTransfer?.files));
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  protected onMoveUp(imageId: string): void {
    this.emitImageAction(this.moveUp, imageId);
  }

  protected onMoveDown(imageId: string): void {
    this.emitImageAction(this.moveDown, imageId);
  }

  protected onRemove(imageId: string): void {
    this.emitImageAction(this.remove, imageId);
  }

  private emitFiles(files: File[]): void {
    if (files.length && !this.interactionDisabled()) {
      this.filesSelected.emit(files);
    }
  }

  private emitImageAction(emitter: OutputEmitterRef<string>, imageId: string): void {
    const id = imageId.trim();
    if (id && !this.interactionDisabled()) {
      emitter.emit(id);
    }
  }
}
