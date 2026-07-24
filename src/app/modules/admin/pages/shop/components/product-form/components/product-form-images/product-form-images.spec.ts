import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormImageItem } from '../../models/product-form-image-item.model';
import { ProductFormImages } from './product-form-images';

describe('ProductFormImages', () => {
  let fixture: ComponentFixture<ProductFormImages>;
  let component: ProductFormImages;

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

  const texts = {
    IMAGES_TITLE: 'Media & Files',
    IMAGES_UPLOAD_LABEL: 'Upload',
    IMAGES_UPLOAD_LOADING_LABEL: 'Uploading...',
    IMAGES_DROPZONE_HINT: 'Drop files here or click to upload',
    IMAGES_ASSIGNED_EMPTY: 'No images yet.',
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormImages],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormImages);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('texts', texts);
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('isUploadLoading', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits filesSelected with image files only', () => {
    const emitSpy = vi.spyOn((component as any).filesSelected, 'emit');
    const imageFile = new File(['image'], 'one.jpg', { type: 'image/jpeg' });
    const textFile = new File(['txt'], 'file.txt', { type: 'text/plain' });
    const event = {
      target: {
        files: {
          length: 2,
          item: (index: number) => [imageFile, textFile][index] ?? null,
          0: imageFile,
          1: textFile,
        },
        value: 'x',
      },
    } as unknown as Event;

    (component as any).onFileInputChange(event);

    expect(emitSpy).toHaveBeenCalledWith([imageFile]);
  });

  it('emits move and remove events', () => {
    const moveUpSpy = vi.spyOn((component as any).moveUp, 'emit');
    const moveDownSpy = vi.spyOn((component as any).moveDown, 'emit');
    const removeSpy = vi.spyOn((component as any).remove, 'emit');

    (component as any).onMoveUp(' img-1 ');
    (component as any).onMoveDown(' img-1 ');
    (component as any).onRemove(' img-1 ');

    expect(moveUpSpy).toHaveBeenCalledWith('img-1');
    expect(moveDownSpy).toHaveBeenCalledWith('img-1');
    expect(removeSpy).toHaveBeenCalledWith('img-1');
  });

  it('emits upload when images are present', () => {
    const uploadSpy = vi.spyOn((component as any).upload, 'emit');

    (component as any).onUpload();

    expect(uploadSpy).toHaveBeenCalled();
  });

  it('does not emit actions when blocked', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();

    const filesSelectedSpy = vi.spyOn((component as any).filesSelected, 'emit');
    const moveUpSpy = vi.spyOn((component as any).moveUp, 'emit');
    const uploadSpy = vi.spyOn((component as any).upload, 'emit');
    const imageFile = new File(['image'], 'one.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: {
          length: 1,
          item: () => imageFile,
          0: imageFile,
        },
        value: 'x',
      },
    } as unknown as Event;

    (component as any).onFileInputChange(event);
    (component as any).onMoveUp('img-1');
    (component as any).onUpload();

    expect(filesSelectedSpy).not.toHaveBeenCalled();
    expect(moveUpSpy).not.toHaveBeenCalled();
    expect(uploadSpy).not.toHaveBeenCalled();
  });
});
