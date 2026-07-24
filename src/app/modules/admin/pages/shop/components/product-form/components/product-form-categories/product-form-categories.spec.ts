import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_FORM_TEXTS } from '../../constants/product-form.constants';
import { ProductFormCategoryNode } from '../../models/product-form-category-node.model';
import { ProductFormCategories } from './product-form-categories';

describe('ProductFormCategories', () => {
  let fixture: ComponentFixture<ProductFormCategories>;
  let component: ProductFormCategories;

  const categories: ProductFormCategoryNode[] = [
    {
      id: 'cat-1',
      label: 'Одяг',
      checked: false,
      children: [{ id: 'cat-2', label: 'Сорочки', checked: true }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormCategories],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormCategories);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders categories title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.CATEGORIES_TITLE);
  });

  it('emits category toggle with normalized id', () => {
    const emitSpy = vi.spyOn((component as any).categoryToggle, 'emit');

    (component as any).onCategoryCheckedChange(' cat-1 ', true);

    expect(emitSpy).toHaveBeenCalledWith({ categoryId: 'cat-1', checked: true });
  });

  it('does not emit category toggle when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const emitSpy = vi.spyOn((component as any).categoryToggle, 'emit');

    (component as any).onCategoryCheckedChange('cat-1', true);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('does not emit category toggle when id is blank', () => {
    const emitSpy = vi.spyOn((component as any).categoryToggle, 'emit');

    (component as any).onCategoryCheckedChange('   ', true);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
