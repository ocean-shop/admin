import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCT_FORM_TEXTS } from '../../constants/product-form.constants';
import { ProductFormAssignedTag } from '../../models/product-form-assigned-tag.model';
import { ProductTagsService } from './services/product-tags/product-tags.service';
import { ProductFormTags } from './product-form-tags';

describe('ProductFormTags', () => {
  let fixture: ComponentFixture<ProductFormTags>;
  let component: ProductFormTags;
  let tagsService: ProductTagsService;
  const assignedTags: ProductFormAssignedTag[] = [{ id: 'tag-5', label: 'Чоловіче' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormTags],
      providers: [provideZonelessChangeDetection(), ...provideTestQueryClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormTags);
    component = fixture.componentInstance;
    tagsService = fixture.debugElement.injector.get(ProductTagsService);

    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
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

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.TAGS_TITLE);
  });

  it('delegates tag search changes to tags service', () => {
    const searchSpy = vi.spyOn(tagsService, 'onSearchChange');

    (component as any).onSearchChange('summer');

    expect(searchSpy).toHaveBeenCalledWith('summer');
  });

  it('delegates tag assignment and unassignment to tags service', () => {
    const assignSpy = vi.spyOn(tagsService, 'onAssign');
    const unassignSpy = vi.spyOn(tagsService, 'onUnassign');

    (component as any).onAssign('tag-1');
    (component as any).onUnassign('tag-5');

    expect(assignSpy).toHaveBeenCalledWith('tag-1');
    expect(unassignSpy).toHaveBeenCalledWith('tag-5');
  });

  it('seeds assigned tags in service state', () => {
    expect(tagsService.assignedItems()).toEqual(assignedTags);
  });
});
