import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { TAGS_PAGE_SIZE, TAGS_TEXTS } from './constants/tags.constants';
import { TagModalModeEnum } from './models/tag-modal-mode.type';
import { TagListResponse } from './models/tag.model';
import { TagsService } from './services/tags.service';
import { Tags } from './tags';

const buildList = (items: TagListResponse['items'], total = items.length): TagListResponse => ({
  items,
  total,
  page: 1,
  limit: TAGS_PAGE_SIZE,
  totalPages: Math.max(1, Math.ceil(total / TAGS_PAGE_SIZE)),
});

describe('Tags', () => {
  let fixture: ComponentFixture<Tags>;
  let component: any;
  let queryClient: QueryClient;
  let paramMap$: BehaviorSubject<ParamMap>;
  let tagsService: {
    getTags: ReturnType<typeof vi.fn>;
    createTag: ReturnType<typeof vi.fn>;
    deleteTag: ReturnType<typeof vi.fn>;
  };
  let toasterService: { success: ReturnType<typeof vi.fn> };

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
  const listKey = (name = ''): readonly unknown[] =>
    SHOP_QUERY_KEYS.tags('shop-1', 1, TAGS_PAGE_SIZE, name);

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    tagsService = {
      getTags: vi.fn().mockReturnValue(of(buildList([{ id: 'tag-1', name: 'Summer' }]))),
      createTag: vi.fn().mockReturnValue(of({ id: 'tag-2', shopId: 'shop-1', name: 'New' })),
      deleteTag: vi.fn().mockReturnValue(of(void 0)),
    };
    toasterService = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Tags],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: TagsService, useValue: tagsService },
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

    queryClient = TestBed.inject(QueryClient);
    fixture = TestBed.createComponent(Tags);
    component = fixture.componentInstance;
    await flushQueries(fixture);
  });

  it('loads the first page for the shop', () => {
    expect(tagsService.getTags).toHaveBeenCalledWith({
      page: 1,
      limit: TAGS_PAGE_SIZE,
      shopId: 'shop-1',
    });
    expect(component.tagRows()).toEqual([{ id: 'tag-1', name: 'Summer' }]);
  });

  it('renders title, breadcrumbs and rows', () => {
    expect(element().textContent).toContain(TAGS_TEXTS.PAGE_TITLE);
    expect(element().querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element().textContent).toContain('Summer');
  });

  it('shows the shop warning and disables actions without a shop id', async () => {
    paramMap$.next(convertToParamMap({}));
    await flushQueries(fixture);

    expect(element().textContent).toContain(TAGS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    expect(component.tags()).toEqual([]);

    component.onCreateTag();
    expect(component.modalMode()).toBeNull();
  });

  it('shows the load error message', async () => {
    tagsService.getTags.mockReturnValue(throwError(() => new Error('boom')));
    await queryClient.resetQueries();
    await flushQueries(fixture);

    expect(element().textContent).toContain(TAGS_TEXTS.LOAD_ERROR_MESSAGE);
  });

  describe('search', () => {
    it('applies a trimmed search and resets the page', async () => {
      component.currentPage.set(2);
      component.searchInput.set('  sum ');
      component.onSearchSubmit();
      await flushQueries(fixture);

      expect(component.searchName()).toBe('sum');
      expect(component.currentPage()).toBe(1);
      expect(tagsService.getTags).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'sum', page: 1 }),
      );
    });

    it('ignores an unchanged search', () => {
      component.currentPage.set(2);
      component.onSearchSubmit();

      expect(component.currentPage()).toBe(2);
    });

    it('resets an applied search', () => {
      component.searchName.set('sum');
      component.searchInput.set('sum');
      component.currentPage.set(2);

      component.onSearchReset();

      expect(component.searchInput()).toBe('');
      expect(component.searchName()).toBe('');
      expect(component.currentPage()).toBe(1);
    });

    it('only clears the input when nothing was applied', () => {
      component.searchInput.set('draft');
      component.currentPage.set(2);

      component.onSearchReset();

      expect(component.searchInput()).toBe('');
      expect(component.currentPage()).toBe(2);
    });
  });

  describe('pagination', () => {
    it('ignores invalid pages', () => {
      component.onPageChange(1);
      component.onPageChange(0);
      component.onPageChange(2);

      expect(component.currentPage()).toBe(1);
    });

    it('moves to a valid page', async () => {
      tagsService.getTags.mockReturnValue(of(buildList([{ id: 'tag-1', name: 'A' }], 45)));
      await queryClient.resetQueries();
      await flushQueries(fixture);

      component.onPageChange(3);

      expect(component.currentPage()).toBe(3);
    });

    it('resets the page when the shop changes', async () => {
      component.currentPage.set(2);
      paramMap$.next(convertToParamMap({ shopId: 'shop-2' }));
      await flushQueries(fixture);

      expect(component.currentPage()).toBe(1);
    });
  });

  describe('create', () => {
    it('opens the create modal', () => {
      component.onCreateTag();

      expect(component.modalMode()).toBe(TagModalModeEnum.Create);
      expect(component.isCreateModalOpen()).toBe(true);
    });

    it('creates a tag, closes the modal and prepends it to the cached page', async () => {
      component.onCreateTag();
      component.onConfirmCreate({ name: 'New' });
      await flushQueries(fixture);

      expect(tagsService.createTag).toHaveBeenCalledWith({ shopId: 'shop-1', name: 'New' });
      expect(toasterService.success).toHaveBeenCalledWith(TAGS_TEXTS.CREATE_SUCCESS_TITLE);
      expect(component.modalMode()).toBeNull();
    });

    it('prepends the created tag when it matches the active search', async () => {
      queryClient.setQueryData(listKey(), buildList([{ id: 'tag-1', name: 'Summer' }]));
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

      component.onConfirmCreate({ name: 'New' });
      await flushQueries(fixture);

      const cached = queryClient.getQueryData<TagListResponse>(listKey());
      expect(cached?.items.map((item) => item.id)).toEqual(['tag-2', 'tag-1']);
      expect(cached?.total).toBe(2);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: SHOP_QUERY_KEYS.tagsScope('shop-1'),
      });
    });

    it('does not prepend a created tag that misses the active search', async () => {
      tagsService.getTags.mockReturnValue(of(buildList([])));
      component.searchName.set('winter');
      queryClient.setQueryData(listKey('winter'), buildList([]));
      vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

      component.onConfirmCreate({ name: 'New' });
      await flushQueries(fixture);

      expect(queryClient.getQueryData<TagListResponse>(listKey('winter'))?.items).toEqual([]);
    });

    it('ignores confirm while another action is running', async () => {
      tagsService.createTag.mockReturnValue(new BehaviorSubject(null));
      component.onConfirmCreate({ name: 'First' });
      await tick();
      component.onConfirmCreate({ name: 'Second' });

      expect(tagsService.createTag).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('opens the delete modal for a known row and ignores unknown rows', () => {
      component.onDeleteTag({ id: 'missing' });
      expect(component.modalMode()).toBeNull();

      component.onDeleteTag({ id: 'tag-1' });
      expect(component.modalMode()).toBe(TagModalModeEnum.Delete);
      expect(component.selectedTag()?.name).toBe('Summer');
    });

    it('deletes the selected tag and removes it from the cache', async () => {
      vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
      component.onDeleteTag({ id: 'tag-1' });

      component.onConfirmDelete();
      await fixture.whenStable();

      expect(tagsService.deleteTag).toHaveBeenCalledWith('tag-1');
      expect(toasterService.success).toHaveBeenCalledWith(TAGS_TEXTS.DELETE_SUCCESS_TITLE);
      expect(queryClient.getQueryData<TagListResponse>(listKey())?.items).toEqual([]);
      expect(component.selectedTag()).toBeNull();
    });

    it('does nothing without a selected tag', () => {
      component.onConfirmDelete();

      expect(tagsService.deleteTag).not.toHaveBeenCalled();
    });
  });

  describe('modal closing', () => {
    it('closes the modal when idle', () => {
      component.onCreateTag();
      component.onCloseModal();

      expect(component.modalMode()).toBeNull();
    });

    it('keeps the modal open while an action is running', async () => {
      tagsService.deleteTag.mockReturnValue(new BehaviorSubject(null));
      component.onDeleteTag({ id: 'tag-1' });
      component.onConfirmDelete();
      await tick();

      component.onCloseModal();

      expect(component.modalMode()).toBe(TagModalModeEnum.Delete);
    });
  });
});
