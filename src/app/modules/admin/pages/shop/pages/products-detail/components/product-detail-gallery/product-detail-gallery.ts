import { Component, computed, input, linkedSignal } from '@angular/core';
import { ImageFileItem } from '@core/models/image-file-item.model';
import { Badge } from '@ui/badge/badge';
import {
  PRODUCTS_DETAIL_GALLERY_POSITION_SEPARATOR,
  PRODUCTS_DETAIL_ICONS,
  PRODUCTS_DETAIL_TEXTS,
} from '../../constants/products-detail.constants';
import { ProductDetailGalleryThumbnail } from '../../models/product-detail-gallery-thumbnail.model';

/** Large preview of the selected product photo with a row of thumbnails to switch between them. */
@Component({
  selector: 'app-product-detail-gallery',
  imports: [Badge],
  templateUrl: './product-detail-gallery.html',
  styleUrl: './product-detail-gallery.scss',
})
export class ProductDetailGallery {
  public readonly images = input.required<ImageFileItem[]>();

  protected readonly textData = PRODUCTS_DETAIL_TEXTS;
  protected readonly placeholderIcon = PRODUCTS_DETAIL_ICONS.IMAGE_PLACEHOLDER;

  /** Back to the first (main) photo whenever the image list changes. */
  protected readonly selectedIndex = linkedSignal({ source: this.images, computation: () => 0 });
  protected readonly activeImage = computed(() => this.images()[this.selectedIndex()] ?? null);
  protected readonly isMainSelected = computed(() => this.selectedIndex() === 0);
  protected readonly positionLabel = computed(
    () =>
      `${this.selectedIndex() + 1}${PRODUCTS_DETAIL_GALLERY_POSITION_SEPARATOR}${this.images().length}`,
  );
  protected readonly thumbnails = computed<ProductDetailGalleryThumbnail[]>(() =>
    this.images().map((image, index) => ({
      id: image.id,
      url: image.imageDataUrl,
      ariaLabel: `${PRODUCTS_DETAIL_TEXTS.GALLERY_THUMBNAIL_PREFIX} ${index + 1}: ${image.name}`,
      selected: index === this.selectedIndex(),
    })),
  );

  protected onSelect(index: number): void {
    this.selectedIndex.set(index);
  }
}
