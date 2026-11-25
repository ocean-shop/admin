import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageFileItem } from '@core/models/image-file-item.model';
import { PRODUCTS_DETAIL_TEXTS } from '../../constants/products-detail.constants';
import { ProductDetailGallery } from './product-detail-gallery';

describe('ProductDetailGallery', () => {
  let fixture: ComponentFixture<ProductDetailGallery>;
  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const images: ImageFileItem[] = [
    { id: 'i-1', name: 'Front', imageDataUrl: 'https://cdn/front.png' },
    { id: 'i-2', name: 'Back', imageDataUrl: 'https://cdn/back.png' },
    { id: 'i-3', name: 'Side', imageDataUrl: 'https://cdn/side.png' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailGallery],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailGallery);
    fixture.componentRef.setInput('images', images);
    await fixture.whenStable();
  });

  it('shows the first photo as the main one with its position', () => {
    const preview = element().querySelector('.product-gallery-preview-image');

    expect(preview?.getAttribute('src')).toBe('https://cdn/front.png');
    expect(preview?.getAttribute('alt')).toBe('Front');
    expect(element().querySelector('.product-gallery-main-badge')?.textContent).toContain(
      PRODUCTS_DETAIL_TEXTS.GALLERY_MAIN_BADGE,
    );
    expect(element().querySelector('.product-gallery-position')?.textContent).toContain('1 / 3');
  });

  it('switches the preview when a thumbnail is clicked', async () => {
    const thumbnails = element().querySelectorAll<HTMLButtonElement>('.product-gallery-thumbnail');
    expect(thumbnails).toHaveLength(3);
    expect(thumbnails[0].getAttribute('aria-pressed')).toBe('true');
    expect(thumbnails[1].getAttribute('aria-label')).toBe(
      `${PRODUCTS_DETAIL_TEXTS.GALLERY_THUMBNAIL_PREFIX} 2: Back`,
    );

    thumbnails[1].click();
    await fixture.whenStable();

    expect(element().querySelector('.product-gallery-preview-image')?.getAttribute('src')).toBe(
      'https://cdn/back.png',
    );
    expect(element().querySelector('.product-gallery-main-badge')).toBeNull();
    expect(element().querySelector('.product-gallery-position')?.textContent).toContain('2 / 3');
    expect(thumbnails[1].classList).toContain('product-gallery-thumbnail-selected');
  });

  it('resets the selection when the images change', async () => {
    (fixture.componentInstance as any).onSelect(2);
    fixture.componentRef.setInput('images', images.slice(0, 2));
    await fixture.whenStable();

    expect((fixture.componentInstance as any).selectedIndex()).toBe(0);
  });

  it('hides thumbnails for a single photo', async () => {
    fixture.componentRef.setInput('images', images.slice(0, 1));
    await fixture.whenStable();

    expect(element().querySelector('.product-gallery-thumbnails')).toBeNull();
  });

  it('shows a placeholder when there are no photos', async () => {
    fixture.componentRef.setInput('images', []);
    await fixture.whenStable();

    expect(element().querySelector('.product-gallery-preview-image')).toBeNull();
    expect(element().querySelector('.product-gallery-empty')?.textContent).toContain(
      PRODUCTS_DETAIL_TEXTS.GALLERY_EMPTY,
    );
  });
});
