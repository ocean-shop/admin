import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductFormImageItem } from '../../../models/product-form-image-item.model';
import { ProductImagesToastTexts } from '../models/product-images-toast-texts.model';
import { ProductImagesService } from './product-images.service';
import { provideTestQueryClient } from '@testing/query-client-test.provider';

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
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };

  const context: ProductFormEditorContext = {
    getShopId: () => 'shop-1',
    getProductId: () => 'product-1',
    isSidebarEnabled: () => true,
  };
  const toastTexts: ProductImagesToastTexts = {
    IMAGES_ASSIGN_SUCCESS_TITLE: 'upload success',
    IMAGES_ASSIGN_ERROR_TITLE: 'upload error',
    IMAGES_ASSIGN_ERROR_MESSAGE: 'upload error message',
  };

  const initialImages: ProductFormImageItem[] = [
    { id: 'img-1', name: 'one.jpg', imageDataUrl: 'data:image/jpeg;base64,aaa' },
    { id: 'img-2', name: 'two.jpg', imageDataUrl: 'data:image/jpeg;base64,bbb' },
  ];

  beforeEach(() => {
    mockProductsService = {
      changeImageSort: vi.fn().mockReturnValue(of(void 0)),
      removeImage: vi.fn().mockReturnValue(of(void 0)),
      assignImages: vi.fn().mockReturnValue(of(void 0)),
      getProductById: vi.fn().mockReturnValue(
        of({
          images: [{ id: 'img-9', image: 'data:image/jpeg;base64,new' }],
        }),
      ),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        ProductImagesService,
        { provide: ProductsService, useValue: mockProductsService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    });

    service = TestBed.inject(ProductImagesService);
    service.configure(context, () => toastTexts);
    service.setImages(initialImages);
  });

  it('moves image down and updates order on success', async () => {
    service.onImageMoveDown('img-1');
    await flushPromises();

    expect(mockProductsService.changeImageSort).toHaveBeenCalledWith('img-1', {
      direction: 'down',
    });
    expect(service.images().map((image) => image.id)).toEqual(['img-2', 'img-1']);
  });

  it('removes image from state on success', async () => {
    service.onImageRemove('img-1');
    await flushPromises();

    expect(mockProductsService.removeImage).toHaveBeenCalledWith('img-1');
    expect(service.images().map((image) => image.id)).toEqual(['img-2']);
  });

  it('uploads images and refreshes from product response', async () => {
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
      { id: 'img-9', name: 'Image 1', imageDataUrl: 'data:image/jpeg;base64,new' },
    ]);
    expect(mockToasterService.success).toHaveBeenCalledWith('upload success');
  });

  it('shows error toast when upload fails', async () => {
    mockProductsService.assignImages.mockReturnValueOnce(throwError(() => new Error('failed')));

    service.uploadImages();
    await flushPromises();

    expect(mockToasterService.danger).toHaveBeenCalledWith('upload error', 'upload error message');
    expect(service.isImageUploadLoading()).toBe(false);
  });
});
