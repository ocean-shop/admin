import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCTS_CREATE_TEXTS } from '../../../../pages/products-create/constants/products-create.constants';
import { ProductFormImageItem } from '../../models/product-form-image-item.model';
import { ProductImagesService } from './services/product-images.service';
import { ProductFormImages } from './product-form-images';
import { provideTestQueryClient } from '@testing/query-client-test.provider';

describe('ProductFormImages', () => {
  let fixture: ComponentFixture<ProductFormImages>;
  let component: ProductFormImages;
  let imagesService: ProductImagesService;

  const images: ProductFormImageItem[] = [
    {
      id: 'img-1',
      name: 'product-image-1.jpg',
      imageDataUrl: 'data:image/jpeg;base64,Zm9v',
    },
    {
      id: 'img-2',
      name: 'product-image-2.jpg',
      imageDataUrl: 'data:image/jpeg;base64,YmFy',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormImages],
      providers: [provideZonelessChangeDetection(), ...provideTestQueryClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormImages);
    component = fixture.componentInstance;
    imagesService = fixture.debugElement.injector.get(ProductImagesService);

    fixture.componentRef.setInput('texts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('toastTexts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('initialImages', images);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delegates selected files to images service', () => {
    const filesSpy = vi.spyOn(imagesService, 'onImageFilesSelected');
    const imageFile = new File(['image'], 'one.jpg', { type: 'image/jpeg' });
    const eventFiles = [imageFile];

    (component as any).onFilesSelected(eventFiles);

    expect(filesSpy).toHaveBeenCalledWith(eventFiles);
  });

  it('delegates move and remove actions to images service', () => {
    const moveUpSpy = vi.spyOn(imagesService, 'onImageMoveUp');
    const moveDownSpy = vi.spyOn(imagesService, 'onImageMoveDown');
    const removeSpy = vi.spyOn(imagesService, 'onImageRemove');

    (component as any).onMoveUp('img-1');
    (component as any).onMoveDown('img-1');
    (component as any).onRemove('img-1');

    expect(moveUpSpy).toHaveBeenCalledWith('img-1');
    expect(moveDownSpy).toHaveBeenCalledWith('img-1');
    expect(removeSpy).toHaveBeenCalledWith('img-1');
  });

  it('delegates upload action to images service', () => {
    const uploadSpy = vi.spyOn(imagesService, 'uploadImages');

    (component as any).onUpload();

    expect(uploadSpy).toHaveBeenCalled();
  });

  it('seeds images in service state', () => {
    expect(imagesService.images()).toEqual(images);
  });
});
