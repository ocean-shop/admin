import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
import { Categories } from './categories';
import { CATEGORIES_TEXTS } from './constants/categories.constants';
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
  let mockToasterService: { success: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockCategoriesService = {
      getCategories: vi.fn().mockReturnValue(
        of({
          items: [
            { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0, productCount: 5 },
            { id: 'cat-2', name: 'Home', slug: 'home', sort: 1, productCount: 3 },
            {
              id: 'cat-3',
              parentId: 'cat-1',
              name: 'Laptops',
              slug: 'laptops',
              sort: 0,
              productCount: 2,
            },
          ],
        }),
      ),
      getCategoryById: vi
        .fn()
        .mockReturnValue(of({ id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 })),
      createCategory: vi.fn().mockReturnValue(of({ id: 'cat-4' })),
      updateCategory: vi.fn().mockReturnValue(of({ id: 'cat-1' })),
      changeCategorySort: vi.fn().mockReturnValue(of({ id: 'cat-1', sort: 1 })),
      deleteCategory: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: ToasterService, useValue: mockToasterService },
        {
          provide: ActivatedRoute,
          useValue: {
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

  it('renders page header and create action', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(CATEGORIES_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(CATEGORIES_TEXTS.CREATE_ROOT_LABEL);
  });

  it('renders nested categories from API response', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(mockCategoriesService.getCategories).toHaveBeenCalledTimes(1);
    expect(pageElement.textContent).toContain('Electronics');
    expect(pageElement.textContent).not.toContain('Laptops');

    const firstToggleButton = fixture.debugElement.query(By.css('.toggle-button'));
    firstToggleButton.triggerEventHandler('click');
    fixture.detectChanges();

    expect(pageElement.textContent).toContain('Laptops');
  });

  it('expands child rows when a parent toggle is clicked', async () => {
    const firstToggleButton = fixture.debugElement.query(By.css('.toggle-button'));

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Laptops');
    firstToggleButton.triggerEventHandler('click');
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Laptops');
  });

  it('creates root category with shopId from route params', () => {
    (component as any).onCreateRootCategory();
    (component as any).onConfirmCreate({
      name: 'Home',
      slug: 'home',
    });

    expect(mockCategoriesService.createCategory).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Home',
      slug: 'home',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.CREATE_SUCCESS_TITLE);
  });

  it('creates child category with parentId', () => {
    const parentNode = (component as any).visibleNodes()[0];

    (component as any).onCreateChildCategory(parentNode);
    (component as any).onConfirmCreate({
      name: 'Tablets',
      slug: 'tablets',
      parentId: parentNode.category.id,
    });

    expect(mockCategoriesService.createCategory).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Tablets',
      slug: 'tablets',
      parentId: 'cat-1',
    });
  });

  it('updates category after loading entity by id', () => {
    const node = (component as any).visibleNodes()[0];

    (component as any).onEditCategory(node);
    (component as any).onConfirmUpdate({
      name: 'Electronics Updated',
      slug: 'electronics-updated',
    });

    expect(mockCategoriesService.getCategoryById).toHaveBeenCalledWith('cat-1');
    expect(mockCategoriesService.updateCategory).toHaveBeenCalledWith('cat-1', {
      name: 'Electronics Updated',
      slug: 'electronics-updated',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.UPDATE_SUCCESS_TITLE);
  });

  it('deletes selected category', () => {
    const node = (component as any).visibleNodes()[0];

    (component as any).onDeleteCategory(node);
    (component as any).onConfirmDelete();

    expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith('cat-1');
    expect(mockToasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.DELETE_SUCCESS_TITLE);
  });

  it('shows warning and blocks create when shopId is missing', async () => {
    paramMap$.next(convertToParamMap({}));
    await fixture.whenStable();
    fixture.detectChanges();

    (component as any).onCreateRootCategory();

    expect((component as any).modalMode()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      CATEGORIES_TEXTS.SHOP_ID_REQUIRED_MESSAGE,
    );
  });

  it('hides stats cards when API does not provide stats fields', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).not.toContain(CATEGORIES_TEXTS.TOTAL_CATEGORIES_LABEL);
    expect(pageElement.textContent).not.toContain(CATEGORIES_TEXTS.DEEPEST_LEVEL_LABEL);
  });

  it('disables up on first sibling and down on last sibling', async () => {
    const firstToggleButton = fixture.debugElement.query(By.css('.toggle-button'));
    firstToggleButton.triggerEventHandler('click');
    await fixture.whenStable();
    fixture.detectChanges();

    const moveUpButtons = fixture.debugElement.queryAll(By.css('button[title="Move category up"]'));
    const moveDownButtons = fixture.debugElement.queryAll(
      By.css('button[title="Move category down"]'),
    );

    expect(moveUpButtons[0].nativeElement.disabled).toBe(true);
    expect(moveDownButtons[0].nativeElement.disabled).toBe(false);
    expect(moveUpButtons[2].nativeElement.disabled).toBe(false);
    expect(moveDownButtons[2].nativeElement.disabled).toBe(true);
  });

  it('moves category down and refreshes sorted tree order', async () => {
    mockCategoriesService.getCategories.mockReturnValueOnce(
      of({
        items: [
          { id: 'cat-2', name: 'Home', slug: 'home', sort: 0, productCount: 3 },
          { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 1, productCount: 5 },
          {
            id: 'cat-3',
            parentId: 'cat-1',
            name: 'Laptops',
            slug: 'laptops',
            sort: 0,
            productCount: 2,
          },
        ],
      }),
    );

    const firstNode = (component as any).visibleNodes()[0];
    (component as any).onChangeSort(firstNode, 'down');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockCategoriesService.changeCategorySort).toHaveBeenCalledWith('cat-1', {
      direction: 'down',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.SORT_SUCCESS_TITLE);

    const rootNames = (component as any)
      .visibleNodes()
      .filter((node: { depth: number }) => node.depth === 0)
      .map((node: { category: { name: string } }) => node.category.name);

    expect(rootNames).toEqual(['Home', 'Electronics']);
  });

  it('preserves expanded state after sort reload', async () => {
    const firstToggleButton = fixture.debugElement.query(By.css('.toggle-button'));
    firstToggleButton.triggerEventHandler('click');
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Laptops');
    expect((component as any).expandedCategoryIds().has('cat-1')).toBe(true);

    const firstNode = (component as any).visibleNodes()[0];
    (component as any).onChangeSort(firstNode, 'down');
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).expandedCategoryIds().has('cat-1')).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Laptops');
  });
});
