import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormImageListItem } from '../../models/product-form-image-list-item.model';
import { ProductFormSharedImages } from './product-form-shared-images';

describe('ProductFormSharedImages', () => {
  let fixture: ComponentFixture<ProductFormSharedImages>;
  let component: ProductFormSharedImages;

  const images: ProductFormImageListItem[] = [
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
      imports: [ProductFormSharedImages],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormSharedImages);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('interactionDisabled', false);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('dropzoneHint', 'Drop files here');
    fixture.componentRef.setInput('emptyStateText', 'No images yet');
    fixture.componentRef.setInput('imageSubTitle', 'Assigned images');
    fixture.componentRef.setInput('allowDrop', true);
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

  it('does not emit actions when disabled', () => {
    fixture.componentRef.setInput('interactionDisabled', true);
    fixture.detectChanges();
    const filesSelectedSpy = vi.spyOn((component as any).filesSelected, 'emit');
    const moveUpSpy = vi.spyOn((component as any).moveUp, 'emit');
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

    expect(filesSelectedSpy).not.toHaveBeenCalled();
    expect(moveUpSpy).not.toHaveBeenCalled();
  });
});
