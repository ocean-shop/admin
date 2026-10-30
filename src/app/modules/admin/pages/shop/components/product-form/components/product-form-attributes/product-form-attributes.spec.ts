import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCT_FORM_TEXTS } from '../../constants/product-form.constants';
import { ProductFormAssignedAttribute } from '../../models/product-form-assigned-attribute.model';
import { ProductAttributesService } from './services/product-attributes/product-attributes.service';
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
      providers: [provideZonelessChangeDetection(), ...provideTestQueryClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormAttributes);
    component = fixture.componentInstance;
    attributesService = fixture.debugElement.injector.get(ProductAttributesService);

    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
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

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.ATTRIBUTES_TITLE);
  });

  it('delegates attribute search changes to attributes service', () => {
    const searchSpy = vi.spyOn(attributesService, 'onSearchChange');

    (component as any).onSearchChange('new search');

    expect(searchSpy).toHaveBeenCalledWith('new search');
  });

  it('delegates attribute assignment and unassignment to attributes service', () => {
    const assignSpy = vi.spyOn(attributesService, 'onAssign');
    const unassignSpy = vi.spyOn(attributesService, 'onUnassign');

    (component as any).onAssign('attr-1');
    (component as any).onUnassign('attr-5');

    expect(assignSpy).toHaveBeenCalledWith('attr-1');
    expect(unassignSpy).toHaveBeenCalledWith('attr-5');
  });

  it('seeds assigned attributes in service state', () => {
    expect(attributesService.assignedItems()).toEqual(assignedAttributes);
  });
});
