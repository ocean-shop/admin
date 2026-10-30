import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { Categories } from './categories';
import { CATEGORIES_TEXTS } from './constants/categories.constants';
import { CategoryModalModeEnum } from './models/category-modal-mode.type';
import { VisibleCategoryNode } from './models/category-tree.model';
import { CategoriesService } from './services/categories/categories.service';

const buildNode = (overrides: Partial<VisibleCategoryNode> = {}): VisibleCategoryNode => ({
  category: { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0 },
  depth: 0,
  hasChildren: false,
  isExpanded: false,
  canMoveUp: false,
  canMoveDown: true,
  ...overrides,
});

describe('Categories', () => {
  let fixture: ComponentFixture<Categories>;
  let component: any;
  let paramMap$: BehaviorSubject<ParamMap>;
  let categoriesService: {
    getCategories: ReturnType<typeof vi.fn>;
    getCategoryById: ReturnType<typeof vi.fn>;
    createCategory: ReturnType<typeof vi.fn>;
    updateCategory: ReturnType<typeof vi.fn>;
    changeCategorySort: ReturnType<typeof vi.fn>;
    deleteCategory: ReturnType<typeof vi.fn>;
  };
  let toasterService: { success: ReturnType<typeof vi.fn> };

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    categoriesService = {
      getCategories: vi.fn().mockReturnValue(
        of({
          items: [
            { id: 'cat-1', name: 'Electronics', slug: 'electronics', sort: 0, productCount: 3 },
            { id: 'cat-2', name: 'Phones', slug: 'phones', sort: 0, parentId: 'cat-1' },
          ],
          totalCategories: 2,
          deepestLevel: 2,
        }),
      ),
      getCategoryById: vi
        .fn()
        .mockReturnValue(
          of({ id: 'cat-2', parentId: 'cat-1', name: 'Phones', slug: 'phones', sort: 0 }),
        ),
      createCategory: vi.fn().mockReturnValue(of({ id: 'cat-3' })),
      updateCategory: vi.fn().mockReturnValue(of({ id: 'cat-1' })),
      changeCategorySort: vi.fn().mockReturnValue(of({ id: 'cat-1', sort: 1 })),
      deleteCategory: vi.fn().mockReturnValue(of(void 0)),
    };
    toasterService = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: CategoriesService, useValue: categoriesService },
        { provide: ToasterService, useValue: toasterService },
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
    await flushQueries(fixture);
  });

  it('loads categories for the current shop and renders the tree expanded', () => {
    expect(categoriesService.getCategories).toHaveBeenCalledWith('shop-1');
    expect(element().textContent).toContain(CATEGORIES_TEXTS.PAGE_TITLE);
    expect(element().textContent).toContain('Electronics');
    expect(element().textContent).toContain('Phones');
    expect(element().textContent).toContain(CATEGORIES_TEXTS.TOTAL_CATEGORIES_LABEL);
    expect(component.hasProductCounts()).toBe(true);
  });

  it('collapses and expands nodes with children', async () => {
    const [root] = component.visibleNodes();

    component.onToggleNode(root);
    await flushQueries(fixture);
    expect(element().textContent).not.toContain('Phones');

    component.onToggleNode(component.visibleNodes()[0]);
    await flushQueries(fixture);
    expect(component.collapsedCategoryIds().has('cat-1')).toBe(false);
    expect(element().textContent).toContain('Phones');
  });

  it('ignores toggles on leaf nodes', () => {
    component.onToggleNode(buildNode({ hasChildren: false }));

    expect(component.collapsedCategoryIds().size).toBe(0);
  });

  it('expands the tree again when the shop changes', async () => {
    component.onToggleNode(component.visibleNodes()[0]);
    paramMap$.next(convertToParamMap({ shopId: 'shop-2' }));
    await flushQueries(fixture);

    expect(component.collapsedCategoryIds().size).toBe(0);
  });

  it('shows the empty state and the shop warning without a shop', async () => {
    paramMap$.next(convertToParamMap({}));
    await flushQueries(fixture);

    expect(element().textContent).toContain(CATEGORIES_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    component.onCreateRootCategory();
    component.onCreateChildCategory(buildNode());
    expect(component.modalMode()).toBeNull();

    component.onConfirmCreate({ name: 'Home', slug: 'home' });
    expect(categoriesService.createCategory).not.toHaveBeenCalled();
  });

  describe('create', () => {
    it('creates a root category', async () => {
      component.onCreateRootCategory();
      component.onConfirmCreate({ name: 'Home', slug: 'home' });
      await flushQueries(fixture);

      expect(categoriesService.createCategory).toHaveBeenCalledWith({
        shopId: 'shop-1',
        name: 'Home',
        slug: 'home',
      });
      expect(toasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.CREATE_SUCCESS_TITLE);
      expect(component.modalMode()).toBeNull();
    });

    it('creates a child category under the selected parent', async () => {
      component.onCreateChildCategory(buildNode());
      expect(component.modalMode()).toBe(CategoryModalModeEnum.CreateChild);
      expect(component.selectedParentCategory()?.id).toBe('cat-1');

      component.onConfirmCreate({ name: 'Tablets', slug: 'tablets', parentId: 'cat-1' });
      await flushQueries(fixture);

      expect(categoriesService.createCategory).toHaveBeenCalledWith({
        shopId: 'shop-1',
        name: 'Tablets',
        slug: 'tablets',
        parentId: 'cat-1',
      });
    });

    it('ignores create when the create modal is closed', () => {
      component.onConfirmCreate({ name: 'Home', slug: 'home' });

      expect(categoriesService.createCategory).not.toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('loads the category and opens the update modal with its parent', async () => {
      component.onEditCategory(buildNode({ category: { ...buildNode().category, id: 'cat-2' } }));
      await flushQueries(fixture);

      expect(categoriesService.getCategoryById).toHaveBeenCalledWith('cat-2');
      expect(component.modalMode()).toBe(CategoryModalModeEnum.Update);
      expect(component.selectedCategory()?.name).toBe('Phones');
      expect(component.selectedParentCategory()?.id).toBe('cat-1');
      expect(component.isEditLoading()).toBe(false);
    });

    it('keeps the modal closed when loading fails', async () => {
      categoriesService.getCategoryById.mockReturnValue(throwError(() => new Error('boom')));

      component.onEditCategory(buildNode());
      await flushQueries(fixture);

      expect(component.modalMode()).toBeNull();
      expect(component.isEditLoading()).toBe(false);
    });

    it('updates the selected category', async () => {
      component.selectedCategory.set(buildNode().category);
      component.onConfirmUpdate({ name: 'Updated', slug: 'updated', parentId: 'cat-9' });
      await flushQueries(fixture);

      expect(categoriesService.updateCategory).toHaveBeenCalledWith('cat-1', {
        name: 'Updated',
        slug: 'updated',
        parentId: 'cat-9',
      });
      expect(toasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.UPDATE_SUCCESS_TITLE);
    });

    it('ignores update without a selected category', () => {
      component.onConfirmUpdate({ name: 'Updated', slug: 'updated' });

      expect(categoriesService.updateCategory).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('opens the confirmation and deletes the category', async () => {
      component.onDeleteCategory(buildNode());
      expect(component.isDeleteModalOpen()).toBe(true);

      component.onConfirmDelete();
      await flushQueries(fixture);

      expect(categoriesService.deleteCategory).toHaveBeenCalledWith('cat-1');
      expect(toasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.DELETE_SUCCESS_TITLE);
      expect(component.isDeleteModalOpen()).toBe(false);
    });

    it('ignores delete without a selected category', () => {
      component.onConfirmDelete();

      expect(categoriesService.deleteCategory).not.toHaveBeenCalled();
    });
  });

  describe('sort', () => {
    it('changes sort when movement is allowed', async () => {
      component.onChangeSort(buildNode(), 'down');
      await flushQueries(fixture);

      expect(categoriesService.changeCategorySort).toHaveBeenCalledWith('cat-1', {
        direction: 'down',
      });
      expect(toasterService.success).toHaveBeenCalledWith(CATEGORIES_TEXTS.SORT_SUCCESS_TITLE);
    });

    it('skips blocked movements', () => {
      component.onChangeSort(buildNode({ canMoveDown: false }), 'down');
      component.onChangeSort(buildNode({ canMoveUp: false }), 'up');

      expect(categoriesService.changeCategorySort).not.toHaveBeenCalled();
    });
  });

  it('closes the modal when idle', () => {
    component.onDeleteCategory(buildNode());
    component.onCloseModal();

    expect(component.modalMode()).toBeNull();
    expect(component.selectedCategory()).toBeNull();
  });
});
