import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { TAGS_TEXTS } from './constants/tags.constants';
import { Tags } from './tags';
import { TagsService } from './services/tags.service';

describe('Tags', () => {
  let fixture: ComponentFixture<Tags>;
  let component: Tags;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockTagsService: {
    getTags: ReturnType<typeof vi.fn>;
    createTag: ReturnType<typeof vi.fn>;
    deleteTag: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockTagsService = {
      getTags: vi.fn().mockReturnValue(
        of({
          items: [{ id: 'tag-1', shopId: 'shop-1', name: 'Summer' }],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      ),
      createTag: vi.fn().mockReturnValue(of({ id: 'tag-2', shopId: 'shop-1', name: 'New' })),
      deleteTag: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Tags],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: TagsService, useValue: mockTagsService },
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

    fixture = TestBed.createComponent(Tags);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads tags for active shop', () => {
    expect(mockTagsService.getTags).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
    });
  });

  it('renders title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(TAGS_TEXTS.PAGE_TITLE);
  });

  it('renders breadcrumbs for shop page', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Dashboard');
    expect(element.textContent).toContain(TAGS_TEXTS.PAGE_TITLE);
  });

  it('creates and deletes tags through modal actions', async () => {
    (component as any).onCreateTag();
    (component as any).onConfirmCreate({ name: 'New' });
    (component as any).selectedTag.set({ id: 'tag-1', shopId: 'shop-1', name: 'Summer' });
    (component as any).onConfirmDelete();
    await fixture.whenStable();

    expect(mockTagsService.createTag).toHaveBeenCalledWith({ shopId: 'shop-1', name: 'New' });
    expect(mockTagsService.deleteTag).toHaveBeenCalledWith('tag-1');
  });

  it('skips create action when shop context is missing', () => {
    (component as any).shopId.set(null);
    (component as any).onCreateTag();
    expect((component as any).modalMode()).toBeNull();
  });

  it('keeps pagination unchanged for invalid pages', () => {
    (component as any).currentPage.set(1);
    (component as any).onPageChange(1);
    (component as any).onPageChange(0);
    (component as any).onPageChange(2);
    expect((component as any).currentPage()).toBe(1);
  });

  it('handles search submit/reset guard branches', () => {
    (component as any).searchInput.set('');
    (component as any).searchName.set('');
    (component as any).onSearchSubmit();
    (component as any).onSearchReset();
    expect((component as any).searchName()).toBe('');
  });

  it('maps tag values with fallbacks', () => {
    expect(
      (component as any).mapTag({ id: '', shopId: '', name: '' }, 'shop-fallback'),
    ).toMatchObject({
      shopId: 'shop-fallback',
      name: 'Untitled tag',
    });
    expect(
      (component as any).mapTag({ id: 'tag-2', shopId: 'shop-2', name: 'Label' }, 'fallback'),
    ).toMatchObject({
      id: 'tag-2',
      shopId: 'shop-2',
      name: 'Label',
    });
  });
});
