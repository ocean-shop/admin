import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCTS_CREATE_TEXTS } from '../../../../pages/products-create/constants/products-create.constants';
import { ProductFormVariation } from '../../models/product-form-variation.model';
import { ProductVariationsService } from './services/product-variations.service';
import { ProductFormVariations } from './product-form-variations';

describe('ProductFormVariations', () => {
  let fixture: ComponentFixture<ProductFormVariations>;
  let component: ProductFormVariations;
  let variationsService: ProductVariationsService;
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
      providers: [provideZonelessChangeDetection(), ...provideTestQueryClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormVariations);
    component = fixture.componentInstance;
    variationsService = fixture.debugElement.injector.get(ProductVariationsService);
    fixture.componentRef.setInput('texts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('toastTexts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('initialVariations', variations);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders variation section title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      PRODUCTS_CREATE_TEXTS.VARIATIONS_TITLE,
    );
  });

  it('delegates add variation action to variations service', () => {
    const addSpy = vi.spyOn(variationsService, 'onVariationAdd');

    (component as any).onVariationAdd();

    expect(addSpy).toHaveBeenCalled();
  });

  it('delegates save variation action to variations service', () => {
    const saveSpy = vi.spyOn(variationsService, 'saveVariation');

    (component as any).onVariationCreate('variation-1');

    expect(saveSpy).toHaveBeenCalledWith({ localId: 'variation-1' });
  });

  it('delegates variation field and remove actions to variations service', () => {
    const changeSpy = vi.spyOn(variationsService, 'onVariationChange');
    const removeSpy = vi.spyOn(variationsService, 'onVariationRemove');

    (component as any).onVariationFieldChange('variation-1', 'title', 'Новий title');
    (component as any).onVariationRemove('variation-1');

    expect(changeSpy).toHaveBeenCalledWith({
      localId: 'variation-1',
      field: 'title',
      value: 'Новий title',
    });
    expect(removeSpy).toHaveBeenCalledWith({ localId: 'variation-1' });
  });

  it('delegates attribute search and toggle actions to variations service', () => {
    const searchSpy = vi.spyOn(variationsService, 'onVariationAttributeSearchChange');
    const assignSpy = vi.spyOn(variationsService, 'onVariationAttributeAssign');
    const unassignSpy = vi.spyOn(variationsService, 'onVariationAttributeUnassign');

    (component as any).onVariationAttributeSearchChange('variation-1', 'col');
    (component as any).onVariationAttributeAssign('variation-1', 'attr-1');
    (component as any).onVariationAttributeUnassign('variation-1', 'attr-1');

    expect(searchSpy).toHaveBeenCalledWith({ localId: 'variation-1', value: 'col' });
    expect(assignSpy).toHaveBeenCalledWith({ localId: 'variation-1', attributeId: 'attr-1' });
    expect(unassignSpy).toHaveBeenCalledWith({ localId: 'variation-1', attributeId: 'attr-1' });
  });

  it('delegates variation image actions to variations service', () => {
    const filesSpy = vi.spyOn(variationsService, 'onVariationImageFilesSelected');
    const moveUpSpy = vi.spyOn(variationsService, 'onVariationImageMoveUp');
    const moveDownSpy = vi.spyOn(variationsService, 'onVariationImageMoveDown');
    const removeSpy = vi.spyOn(variationsService, 'onVariationImageRemove');
    const imageFile = new File(['x'], 'x.jpg', { type: 'image/jpeg' });

    (component as any).onVariationImageFilesSelected('variation-1', [imageFile]);
    (component as any).onVariationImageMoveUp('variation-1', 'img-1');
    (component as any).onVariationImageMoveDown('variation-1', 'img-1');
    (component as any).onVariationImageRemove('variation-1', 'img-1');

    expect(filesSpy).toHaveBeenCalledWith({ localId: 'variation-1', files: [imageFile] });
    expect(moveUpSpy).toHaveBeenCalledWith({ localId: 'variation-1', imageId: 'img-1' });
    expect(moveDownSpy).toHaveBeenCalledWith({ localId: 'variation-1', imageId: 'img-1' });
    expect(removeSpy).toHaveBeenCalledWith({ localId: 'variation-1', imageId: 'img-1' });
  });

  it('seeds variations in service state', () => {
    expect(variationsService.variations()).toEqual(variations);
  });
});
