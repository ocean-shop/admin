import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCTS_CREATE_TEXTS } from '../../../../pages/products-create/constants/products-create.constants';
import { ProductFormAssignedTag } from '../../models/product-form-assigned-tag.model';
import { ProductTagsService } from './services/product-tags.service';
import { ProductFormTags } from './product-form-tags';

describe('ProductFormTags', () => {
  let fixture: ComponentFixture<ProductFormTags>;
  let component: ProductFormTags;
  let tagsService: ProductTagsService;
  const assignedTags: ProductFormAssignedTag[] = [{ id: 'tag-5', label: 'Чоловіче' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormTags],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormTags);
    component = fixture.componentInstance;
    tagsService = fixture.debugElement.injector.get(ProductTagsService);

    fixture.componentRef.setInput('texts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('toastTexts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('initialAssignedTags', assignedTags);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders tags title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCTS_CREATE_TEXTS.TAGS_TITLE);
  });

  it('delegates tag search changes to tags service', () => {
    const searchSpy = vi.spyOn(tagsService, 'onTagSearchChange');

    (component as any).onTagSearchChange('summer');

    expect(searchSpy).toHaveBeenCalledWith('summer');
  });

  it('delegates tag assignment and unassignment to tags service', () => {
    const assignSpy = vi.spyOn(tagsService, 'onTagAssign');
    const unassignSpy = vi.spyOn(tagsService, 'onTagUnassign');

    (component as any).onTagAssign('tag-1');
    (component as any).onTagUnassign('tag-5');

    expect(assignSpy).toHaveBeenCalledWith('tag-1');
    expect(unassignSpy).toHaveBeenCalledWith('tag-5');
  });

  it('seeds assigned tags in service state', () => {
    expect(tagsService.assignedTags()).toEqual(assignedTags);
  });
});
