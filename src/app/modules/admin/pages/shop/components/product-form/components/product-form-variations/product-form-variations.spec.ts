import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PRODUCT_FORM_TEXTS } from '../../constants/product-form.constants';
import { ProductFormVariation } from '../../models/product-form-variation.model';
import { ProductFormVariations } from './product-form-variations';

describe('ProductFormVariations', () => {
  let fixture: ComponentFixture<ProductFormVariations>;
  let component: ProductFormVariations;
  const variations: ProductFormVariation[] = [
    {
      localId: 'variation-1',
      id: null,
      title: 'Синій M',
      name: 'Синій / M',
      price: '99.00',
      oldPrice: '129.00',
      sku: 'SKU-BL-M',
      available: true,
      isMain: false,
      attributes: [],
      attributeSearchValue: '',
      attributeSearchResults: [],
      isAttributeSearchLoading: false,
      images: [],
      isSaving: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormVariations],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormVariations);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('variations', variations);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders variation section title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCT_FORM_TEXTS.VARIATIONS_TITLE,
    );
  });

  it('emits add variation event', () => {
    const emitSpy = vi.spyOn((component as any).variationAdd, 'emit');
    const addButton = fixture.debugElement.query(By.css('.product-form-add-button'))
      .nativeElement as HTMLButtonElement;

    addButton.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('emits save variation event', () => {
    const emitSpy = vi.spyOn((component as any).variationCreate, 'emit');
    const saveButton = fixture.debugElement.query(By.css('.product-form-submit-button'))
      .nativeElement as HTMLButtonElement;

    saveButton.click();

    expect(emitSpy).toHaveBeenCalledWith({ localId: 'variation-1' });
  });

  it('emits variation field and remove events', () => {
    const changeSpy = vi.spyOn((component as any).variationChange, 'emit');
    const removeSpy = vi.spyOn((component as any).variationRemove, 'emit');

    (component as any).onVariationFieldChange('variation-1', 'title', 'Новий title');
    (component as any).onVariationRemove('variation-1');

    expect(changeSpy).toHaveBeenCalledWith({
      localId: 'variation-1',
      field: 'title',
      value: 'Новий title',
    });
    expect(removeSpy).toHaveBeenCalledWith({ localId: 'variation-1' });
  });

  it('emits attribute search and toggle events', () => {
    const searchSpy = vi.spyOn((component as any).variationAttributeSearchChange, 'emit');
    const assignSpy = vi.spyOn((component as any).variationAttributeAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).variationAttributeUnassign, 'emit');

    (component as any).onVariationAttributeSearchChange('variation-1', 'col');
    (component as any).onVariationAttributeAssign('variation-1', 'attr-1');
    (component as any).onVariationAttributeUnassign('variation-1', 'attr-1');

    expect(searchSpy).toHaveBeenCalledWith({ localId: 'variation-1', value: 'col' });
    expect(assignSpy).toHaveBeenCalledWith({ localId: 'variation-1', attributeId: 'attr-1' });
    expect(unassignSpy).toHaveBeenCalledWith({ localId: 'variation-1', attributeId: 'attr-1' });
  });

  it('emits variation image events', () => {
    const filesSpy = vi.spyOn((component as any).variationImageFilesSelected, 'emit');
    const moveUpSpy = vi.spyOn((component as any).variationImageMoveUp, 'emit');
    const moveDownSpy = vi.spyOn((component as any).variationImageMoveDown, 'emit');
    const removeSpy = vi.spyOn((component as any).variationImageRemove, 'emit');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    const imageFile = new File(['x'], 'x.jpg', { type: 'image/jpeg' });
    const textFile = new File(['x'], 'x.txt', { type: 'text/plain' });
    Object.defineProperty(fileInput, 'files', {
      value: {
        0: imageFile,
        1: textFile,
        length: 2,
        item: (index: number) => (index === 0 ? imageFile : textFile),
      },
    });

    (component as any).onVariationImageInputChange('variation-1', {
      target: fileInput,
    } as unknown as Event);
    (component as any).onVariationImageMoveUp('variation-1', 'img-1');
    (component as any).onVariationImageMoveDown('variation-1', 'img-1');
    (component as any).onVariationImageRemove('variation-1', 'img-1');

    expect(filesSpy).toHaveBeenCalledWith({ localId: 'variation-1', files: [imageFile] });
    expect(moveUpSpy).toHaveBeenCalledWith({ localId: 'variation-1', imageId: 'img-1' });
    expect(moveDownSpy).toHaveBeenCalledWith({ localId: 'variation-1', imageId: 'img-1' });
    expect(removeSpy).toHaveBeenCalledWith({ localId: 'variation-1', imageId: 'img-1' });
  });

  it('blocks actions when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const addSpy = vi.spyOn((component as any).variationAdd, 'emit');
    const createSpy = vi.spyOn((component as any).variationCreate, 'emit');
    const removeSpy = vi.spyOn((component as any).variationRemove, 'emit');
    const changeSpy = vi.spyOn((component as any).variationChange, 'emit');
    const assignSpy = vi.spyOn((component as any).variationAttributeAssign, 'emit');
    const imageSpy = vi.spyOn((component as any).variationImageMoveUp, 'emit');

    (component as any).onVariationAdd();
    (component as any).onVariationCreate('variation-1');
    (component as any).onVariationRemove('variation-1');
    (component as any).onVariationFieldChange('variation-1', 'title', 'x');
    (component as any).onVariationAttributeAssign('variation-1', 'attr-1');
    (component as any).onVariationImageMoveUp('variation-1', 'img-1');

    expect(addSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
    expect(imageSpy).not.toHaveBeenCalled();
  });
});
