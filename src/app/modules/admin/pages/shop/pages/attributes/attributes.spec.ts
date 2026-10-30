import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { ATTRIBUTES_PAGE_SIZE, ATTRIBUTES_TEXTS } from './constants/attributes.constants';
import { AttributeModalModeEnum } from './models/attribute-modal-mode.type';
import { AttributeListResponse } from './models/attribute.model';
import { AttributesService } from './services/attributes/attributes.service';
import { Attributes } from './attributes';

const buildList = (
  items: AttributeListResponse['items'],
  total = items.length,
): AttributeListResponse => ({
  items,
  total,
  page: 1,
  limit: ATTRIBUTES_PAGE_SIZE,
  totalPages: Math.max(1, Math.ceil(total / ATTRIBUTES_PAGE_SIZE)),
});

describe('Attributes', () => {
  let fixture: ComponentFixture<Attributes>;
  let component: any;
  let queryClient: QueryClient;
  let paramMap$: BehaviorSubject<ParamMap>;
  let attributesService: {
    getAttributes: ReturnType<typeof vi.fn>;
    createAttribute: ReturnType<typeof vi.fn>;
    deleteAttribute: ReturnType<typeof vi.fn>;
  };
  let toasterService: { success: ReturnType<typeof vi.fn> };

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
  const listKey = (name = ''): readonly unknown[] =>
    SHOP_QUERY_KEYS.attributes('shop-1', 1, ATTRIBUTES_PAGE_SIZE, name);

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    attributesService = {
      getAttributes: vi
        .fn()
        .mockReturnValue(of(buildList([{ id: 'tag-1', name: 'Summer', value: 'Blue' }]))),
      createAttribute: vi
        .fn()
        .mockReturnValue(of({ id: 'tag-2', shopId: 'shop-1', name: 'New', value: 'M' })),
      deleteAttribute: vi.fn().mockReturnValue(of(void 0)),
    };
    toasterService = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Attributes],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: AttributesService, useValue: attributesService },
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
    fixture = TestBed.createComponent(Attributes);
    component = fixture.componentInstance;
    await flushQueries(fixture);
  });

  it('loads the first page for the shop', () => {
    expect(attributesService.getAttributes).toHaveBeenCalledWith({
      page: 1,
      limit: ATTRIBUTES_PAGE_SIZE,
      shopId: 'shop-1',
    });
    expect(component.attributeRows()).toEqual([{ id: 'tag-1', name: 'Summer', value: 'Blue' }]);
  });

  it('renders title, breadcrumbs and rows', () => {
    expect(element().textContent).toContain(ATTRIBUTES_TEXTS.PAGE_TITLE);
    expect(element().querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element().textContent).toContain('Summer');
  });

  it('shows the shop warning and disables actions without a shop id', async () => {
    paramMap$.next(convertToParamMap({}));
    await flushQueries(fixture);

    expect(element().textContent).toContain(ATTRIBUTES_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    expect(component.attributes()).toEqual([]);

    component.onCreateAttribute();
    expect(component.modalMode()).toBeNull();
  });

  it('shows the load error message', async () => {
    attributesService.getAttributes.mockReturnValue(throwError(() => new Error('boom')));
    await queryClient.resetQueries();
    await flushQueries(fixture);

    expect(element().textContent).toContain(ATTRIBUTES_TEXTS.LOAD_ERROR_MESSAGE);
  });

  describe('search', () => {
    it('applies a trimmed search and resets the page', async () => {
      component.currentPage.set(2);
      component.searchInput.set('  sum ');
      component.onSearchSubmit();
      await flushQueries(fixture);

      expect(component.searchName()).toBe('sum');
      expect(component.currentPage()).toBe(1);
      expect(attributesService.getAttributes).toHaveBeenLastCalledWith(
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
      attributesService.getAttributes.mockReturnValue(
        of(buildList([{ id: 'tag-1', name: 'A' }], 45)),
      );
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
      component.onCreateAttribute();

      expect(component.modalMode()).toBe(AttributeModalModeEnum.Create);
      expect(component.isCreateModalOpen()).toBe(true);
    });

    it('creates an attribute, closes the modal and prepends it to the cached page', async () => {
      component.onCreateAttribute();
      component.onConfirmCreate({ name: 'New', value: 'M' });
      await flushQueries(fixture);

      expect(attributesService.createAttribute).toHaveBeenCalledWith({
        shopId: 'shop-1',
        name: 'New',
        value: 'M',
      });
      expect(toasterService.success).toHaveBeenCalledWith(ATTRIBUTES_TEXTS.CREATE_SUCCESS_TITLE);
      expect(component.modalMode()).toBeNull();
    });

    it('prepends the created attribute when it matches the active search', async () => {
      queryClient.setQueryData(listKey(), buildList([{ id: 'tag-1', name: 'Summer' }]));
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

      component.onConfirmCreate({ name: 'New', value: 'M' });
      await flushQueries(fixture);

      const cached = queryClient.getQueryData<AttributeListResponse>(listKey());
      expect(cached?.items.map((item) => item.id)).toEqual(['tag-2', 'tag-1']);
      expect(cached?.total).toBe(2);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: SHOP_QUERY_KEYS.attributesScope('shop-1'),
      });
    });

    it('does not prepend a created attribute that misses the active search', async () => {
      attributesService.getAttributes.mockReturnValue(of(buildList([])));
      component.searchName.set('winter');
      queryClient.setQueryData(listKey('winter'), buildList([]));
      vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

      component.onConfirmCreate({ name: 'New', value: 'M' });
      await flushQueries(fixture);

      expect(queryClient.getQueryData<AttributeListResponse>(listKey('winter'))?.items).toEqual([]);
    });

    it('ignores confirm while another action is running', async () => {
      attributesService.createAttribute.mockReturnValue(new BehaviorSubject(null));
      component.onConfirmCreate({ name: 'First', value: 'M' });
      await tick();
      component.onConfirmCreate({ name: 'Second', value: 'M' });

      expect(attributesService.createAttribute).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('opens the delete modal for a known row and ignores unknown rows', () => {
      component.onDeleteAttribute({ id: 'missing' });
      expect(component.modalMode()).toBeNull();

      component.onDeleteAttribute({ id: 'tag-1' });
      expect(component.modalMode()).toBe(AttributeModalModeEnum.Delete);
      expect(component.selectedAttribute()?.name).toBe('Summer');
    });

    it('deletes the selected attribute and removes it from the cache', async () => {
      vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
      component.onDeleteAttribute({ id: 'tag-1' });

      component.onConfirmDelete();
      await fixture.whenStable();

      expect(attributesService.deleteAttribute).toHaveBeenCalledWith('tag-1');
      expect(toasterService.success).toHaveBeenCalledWith(ATTRIBUTES_TEXTS.DELETE_SUCCESS_TITLE);
      expect(queryClient.getQueryData<AttributeListResponse>(listKey())?.items).toEqual([]);
      expect(component.selectedAttribute()).toBeNull();
    });

    it('does nothing without a selected attribute', () => {
      component.onConfirmDelete();

      expect(attributesService.deleteAttribute).not.toHaveBeenCalled();
    });
  });

  describe('modal closing', () => {
    it('closes the modal when idle', () => {
      component.onCreateAttribute();
      component.onCloseModal();

      expect(component.modalMode()).toBeNull();
    });

    it('keeps the modal open while an action is running', async () => {
      attributesService.deleteAttribute.mockReturnValue(new BehaviorSubject(null));
      component.onDeleteAttribute({ id: 'tag-1' });
      component.onConfirmDelete();
      await tick();

      component.onCloseModal();

      expect(component.modalMode()).toBe(AttributeModalModeEnum.Delete);
    });
  });
});
