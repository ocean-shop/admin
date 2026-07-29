import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCTS_CREATE_TEXTS } from '../../../../pages/products-create/constants/products-create.constants';
import { ProductFormAssignedAttribute } from '../../models/product-form-assigned-attribute.model';
import { ProductAttributesService } from './services/product-attributes.service';
import { ProductFormAttributes } from './product-form-attributes';

describe('ProductFormAttributes', () => {
  let fixture: ComponentFixture<ProductFormAttributes>;
  let component: ProductFormAttributes;
  let attributesService: ProductAttributesService;
  const assignedAttributes: ProductFormAssignedAttribute[] = [
    { id: 'attr-5', label: 'Матеріал: Льон' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormAttributes],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormAttributes);
    component = fixture.componentInstance;
    attributesService = fixture.debugElement.injector.get(ProductAttributesService);

    fixture.componentRef.setInput('texts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('toastTexts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('initialAssignedAttributes', assignedAttributes);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders attributes title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCTS_CREATE_TEXTS.ATTRIBUTES_TITLE);
  });

  it('delegates attribute search changes to attributes service', () => {
    const searchSpy = vi.spyOn(attributesService, 'onAttributeSearchChange');

    (component as any).onAttributeSearchChange('new search');

    expect(searchSpy).toHaveBeenCalledWith('new search');
  });

  it('delegates attribute assignment and unassignment to attributes service', () => {
    const assignSpy = vi.spyOn(attributesService, 'onAttributeAssign');
    const unassignSpy = vi.spyOn(attributesService, 'onAttributeUnassign');

    (component as any).onAttributeAssign('attr-1');
    (component as any).onAttributeUnassign('attr-5');

    expect(assignSpy).toHaveBeenCalledWith('attr-1');
    expect(unassignSpy).toHaveBeenCalledWith('attr-5');
  });

  it('seeds assigned attributes in service state', () => {
    expect(attributesService.assignedAttributes()).toEqual(assignedAttributes);
  });
});
