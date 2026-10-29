import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCT_FALLBACK_LABELS } from '../../../../../constants/product-fallback-labels.constants';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { PRODUCT_FORM_TOAST_TEXTS } from '../../../constants/product-form.constants';
import { ProductFormImageItem } from '../../../models/product-form-image-item.model';
import { ProductImagesService } from './product-images.service';

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('ProductImagesService', () => {
  let service: ProductImagesService;
  let mockProductsService: {
    changeImageSort: ReturnType<typeof vi.fn>;
    removeImage: ReturnType<typeof vi.fn>;
    assignImages: ReturnType<typeof vi.fn>;
    getProductById: ReturnType<typeof vi.fn>;
  };
  let toaster: { success: ReturnType<typeof vi.fn> };
  let sidebarEnabled: boolean;
  let productId: string | null;

  const initialImages: ProductFormImageItem[] = [
    { id: 'img-1', name: 'one.jpg', imageDataUrl: 'data:image/jpeg;base64,aaa' },
    { id: 'img-2', name: 'two.jpg', imageDataUrl: 'data:image/jpeg;base64,bbb' },
  ];

  beforeEach(() => {
    sidebarEnabled = true;
    productId = 'product-1';
    mockProductsService = {
      changeImageSort: vi.fn().mockReturnValue(of(undefined)),
      removeImage: vi.fn().mockReturnValue(of(undefined)),
      assignImages: vi.fn().mockReturnValue(of(undefined)),
      getProductById: vi
        .fn()
        .mockReturnValue(of({ images: [{ id: 'img-9', image: 'data:image/jpeg;base64,new' }] })),
    };
    toaster = { success: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductImagesService,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: ToasterService, useValue: toaster },
      ],
    });

    service = TestBed.inject(ProductImagesService);
    service.configure({
      getShopId: () => null,
      getProductId: () => productId,
      isSidebarEnabled: () => sidebarEnabled,
    });
    service.setImages(initialImages);
  });

  it('moves images down and up on success', async () => {
    service.onImageMoveDown('img-1');
    await flushPromises();

    expect(mockProductsService.changeImageSort).toHaveBeenCalledWith('img-1', {
      direction: 'down',
    });
    expect(service.images().map((image) => image.id)).toEqual(['img-2', 'img-1']);

    service.onImageMoveUp('img-1');
    await flushPromises();

    expect(mockProductsService.changeImageSort).toHaveBeenCalledWith('img-1', { direction: 'up' });
    expect(service.images().map((image) => image.id)).toEqual(['img-1', 'img-2']);
  });

  it('removes an image from state on success', async () => {
    service.onImageRemove('img-1');
    await flushPromises();

    expect(mockProductsService.removeImage).toHaveBeenCalledWith('img-1');
    expect(service.images().map((image) => image.id)).toEqual(['img-2']);
  });

  it('ignores blank ids and edits while the sidebar is disabled', () => {
    service.onImageRemove('  ');
    sidebarEnabled = false;
    service.onImageMoveUp('img-2');

    expect(mockProductsService.removeImage).not.toHaveBeenCalled();
    expect(mockProductsService.changeImageSort).not.toHaveBeenCalled();
  });

  it('appends selected image files', async () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    service.onImageFilesSelected([file, new File(['x'], 'notes.txt', { type: 'text/plain' })]);

    await vi.waitFor(() => expect(service.images()).toHaveLength(3));
  });

  it('uploads images and refreshes them from the product response', async () => {
    service.uploadImages();
    await flushPromises();

    expect(mockProductsService.assignImages).toHaveBeenCalledWith('product-1', {
      images: [
        { image: 'data:image/jpeg;base64,aaa', sort: 0 },
        { image: 'data:image/jpeg;base64,bbb', sort: 1 },
      ],
    });
    expect(mockProductsService.getProductById).toHaveBeenCalledWith('product-1');
    expect(service.images()).toEqual([
      {
        id: 'img-9',
        name: `${PRODUCT_FALLBACK_LABELS.IMAGE_PREFIX} 1`,
        imageDataUrl: 'data:image/jpeg;base64,new',
      },
    ]);
    expect(toaster.success).toHaveBeenCalledWith(
      PRODUCT_FORM_TOAST_TEXTS.IMAGES_ASSIGN_SUCCESS_TITLE,
    );
  });

  it('does not upload without a product or images', () => {
    productId = null;
    service.uploadImages();
    productId = 'product-1';
    service.setImages([]);
    service.uploadImages();

    expect(mockProductsService.assignImages).not.toHaveBeenCalled();
  });

  it('keeps the images and resets loading when the upload fails', async () => {
    mockProductsService.assignImages.mockReturnValueOnce(throwError(() => new Error('failed')));

    service.uploadImages();
    await flushPromises();

    expect(service.images()).toEqual(initialImages);
    expect(toaster.success).not.toHaveBeenCalled();
    expect(service.isImageUploadLoading()).toBe(false);
  });
});
