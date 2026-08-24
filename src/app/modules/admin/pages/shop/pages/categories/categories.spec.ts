import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { Categories } from './categories';
import { CATEGORIES_TEXTS } from './constants/categories.constants';
import { CategoryModalModeEnum } from './models/category-modal-mode.type';
import { CategoriesService } from './services/categories.service';

describe('Categories', () => {
  let fixture: ComponentFixture<Categories>;
  let component: Categories;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockCategoriesService: {
    getCategories: ReturnType<typeof vi.fn>;
    getCategoryById: ReturnType<typeof vi.fn>;
    createCategory: ReturnType<typeof vi.fn>;
    updateCategory: ReturnType<typeof vi.fn>;
    changeCategorySort: ReturnType<typeof vi.fn>;
    deleteCategory: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(of({ items: [] })),
      getCategoryById: vi
        .fn()
        .mockReturnValue(of({ id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 })),
      createCategory: vi.fn().mockReturnValue(of({ id: 'cat-2' })),
      updateCategory: vi.fn().mockReturnValue(of({ id: 'cat-1' })),
      changeCategorySort: vi.fn().mockReturnValue(of({ id: 'cat-1', sort: 1 })),
      deleteCategory: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Categories);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders breadcrumbs for shop page', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Dashboard');
    expect(element.textContent).toContain(CATEGORIES_TEXTS.PAGE_TITLE);
  });

  it('loads categories for current shop', () => {
    expect(mockCategoriesService.getCategories).toHaveBeenCalledWith('shop-1');
  });

  it('creates root category', async () => {
    (component as any).modalMode.set(CategoryModalModeEnum.CreateRoot);
    (component as any).onConfirmCreate({ name: 'Home', slug: 'home' });
    await fixture.whenStable();

    expect(mockCategoriesService.createCategory).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Home',
      slug: 'home',
    });
  });

  it('updates selected category', async () => {
    (component as any).selectedCategory.set({
      id: 'cat-1',
      name: 'Electronics',
      slug: 'electronics',
      sort: 0,
    });
    (component as any).onConfirmUpdate({
      name: 'Electronics Updated',
      slug: 'electronics-updated',
    });
    await fixture.whenStable();

    expect(mockCategoriesService.updateCategory).toHaveBeenCalledWith('cat-1', {
      name: 'Electronics Updated',
      slug: 'electronics-updated',
    });
  });

  it('deletes selected category', async () => {
    (component as any).selectedCategory.set({
      id: 'cat-1',
      name: 'Electronics',
      slug: 'electronics',
      sort: 0,
    });
    (component as any).onConfirmDelete();
    await fixture.whenStable();

    expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith('cat-1');
  });

  it('changes sort when movement is allowed', async () => {
    (component as any).onChangeSort(
      {
        category: { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 },
        depth: 0,
        hasChildren: false,
        isExpanded: false,
        canMoveUp: false,
        canMoveDown: true,
      },
      'down',
    );
    await fixture.whenStable();

    expect(mockCategoriesService.changeCategorySort).toHaveBeenCalledWith('cat-1', {
      direction: 'down',
    });
  });

  it('resolves stats and category arrays from all supported response shapes', () => {
    expect((component as any).resolveStats([])).toEqual({});
    expect((component as any).resolveStats({ totalCategories: 2, deepestLevel: 3 })).toEqual({
      totalCategories: 2,
      deepestLevel: 3,
    });
    expect((component as any).resolveStats({ totalCategories: 1 })).toEqual({
      totalCategories: 1,
    });
    expect((component as any).resolveStats({ deepestLevel: 4 })).toEqual({
      deepestLevel: 4,
    });

    expect((component as any).extractCategories([{ id: 'a', name: 'A' }])).toEqual([
      { id: 'a', name: 'A' },
    ]);
    expect((component as any).extractCategories({ items: [{ id: 'b', name: 'B' }] })).toEqual([
      { id: 'b', name: 'B' },
    ]);
    expect((component as any).extractCategories({ categories: [{ id: 'c', name: 'C' }] })).toEqual([
      { id: 'c', name: 'C' },
    ]);
    expect((component as any).extractCategories({ data: [{ id: 'd', name: 'D' }] })).toEqual([
      { id: 'd', name: 'D' },
    ]);
    expect((component as any).extractCategories({})).toEqual([]);
  });

  it('maps category fallbacks and toggles nodes safely', () => {
    expect(
      (component as any).mapCategory({
        id: '',
        name: '',
        slug: '',
        sort: undefined,
        productsCount: 5,
      }),
    ).toMatchObject({
      name: 'Untitled category',
      slug: 'category',
      sort: 0,
      productCount: 5,
    });

    const expanded = (component as any).expandedCategoryIds();
    expect(expanded.size).toBe(0);

    (component as any).onToggleNode({
      category: { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 },
      depth: 0,
      hasChildren: false,
      isExpanded: false,
      canMoveUp: false,
      canMoveDown: false,
    });
    expect((component as any).expandedCategoryIds().size).toBe(0);

    (component as any).onToggleNode({
      category: { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 },
      depth: 0,
      hasChildren: true,
      isExpanded: false,
      canMoveUp: false,
      canMoveDown: true,
    });
    expect((component as any).expandedCategoryIds().has('cat-1')).toBe(true);
  });

  it('skips sort mutation when movement is blocked', () => {
    (component as any).onChangeSort(
      {
        category: { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 },
        depth: 0,
        hasChildren: false,
        isExpanded: false,
        canMoveUp: false,
        canMoveDown: false,
      },
      'down',
    );

    expect(mockCategoriesService.changeCategorySort).not.toHaveBeenCalled();
  });
});
