import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCTS_CREATE_TEXTS } from '../../../../pages/products-create/constants/products-create.constants';
import { ProductCategoriesService } from './services/product-categories.service';
import { ProductFormCategories } from './product-form-categories';

describe('ProductFormCategories', () => {
  let fixture: ComponentFixture<ProductFormCategories>;
  let component: ProductFormCategories;
  let categoriesService: ProductCategoriesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormCategories],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormCategories);
    component = fixture.componentInstance;
    categoriesService = fixture.debugElement.injector.get(ProductCategoriesService);

    fixture.componentRef.setInput('texts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('toastTexts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('initialSelectedCategoryIds', new Set(['cat-2']));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders categories title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCTS_CREATE_TEXTS.CATEGORIES_TITLE);
  });

  it('delegates category toggles to categories service', () => {
    const toggleSpy = vi.spyOn(categoriesService, 'onCategoryToggle');

    (component as any).onCategoryCheckedChange('cat-1', true);

    expect(toggleSpy).toHaveBeenCalledWith({ categoryId: 'cat-1', checked: true });
  });

  it('does not delegate category toggle when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const toggleSpy = vi.spyOn(categoriesService, 'onCategoryToggle');

    (component as any).onCategoryCheckedChange('cat-1', true);

    expect(toggleSpy).not.toHaveBeenCalled();
  });

  it('seeds selected categories from input', () => {
    expect(Array.from(categoriesService.selectedCategoryIds())).toEqual(['cat-2']);
  });
});
