import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { Attributes } from './attributes';
import { ATTRIBUTES_TEXTS } from './constants/attributes.constants';
import { AttributesService } from './services/attributes.service';

describe('Attributes', () => {
  let fixture: ComponentFixture<Attributes>;
  let component: Attributes;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockAttributesService: {
    getAttributes: ReturnType<typeof vi.fn>;
    createAttribute: ReturnType<typeof vi.fn>;
    deleteAttribute: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    mockAttributesService = {
      getAttributes: vi.fn().mockReturnValue(
        of({
          items: [{ id: 'attr-1', shopId: 'shop-1', name: 'Color', value: 'Blue' }],
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      ),
      createAttribute: vi
        .fn()
        .mockReturnValue(of({ id: 'attr-2', shopId: 'shop-1', name: 'Size', value: 'M' })),
      deleteAttribute: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Attributes],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: AttributesService, useValue: mockAttributesService },
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

    fixture = TestBed.createComponent(Attributes);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads attributes for active shop', () => {
    expect(mockAttributesService.getAttributes).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
    });
  });

  it('renders title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      ATTRIBUTES_TEXTS.PAGE_TITLE,
    );
  });

  it('renders breadcrumbs for shop page', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Головна');
    expect(element.textContent).toContain(ATTRIBUTES_TEXTS.PAGE_TITLE);
  });

  it('creates and deletes attributes through modal actions', async () => {
    (component as any).onCreateAttribute();
    (component as any).onConfirmCreate({ name: 'Size', value: 'M' });
    (component as any).selectedAttribute.set({
      id: 'attr-1',
      shopId: 'shop-1',
      name: 'Color',
      value: 'Blue',
    });
    (component as any).onConfirmDelete();
    await fixture.whenStable();

    expect(mockAttributesService.createAttribute).toHaveBeenCalledWith({
      shopId: 'shop-1',
      name: 'Size',
      value: 'M',
    });
    expect(mockAttributesService.deleteAttribute).toHaveBeenCalledWith('attr-1');
  });

  it('skips create action when shop context is missing', () => {
    (component as any).shopId.set(null);
    (component as any).onCreateAttribute();
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

  it('maps attribute values with fallbacks', () => {
    expect(
      (component as any).mapAttribute({ id: '', shopId: '', name: '', value: '' }, 'shop-fallback'),
    ).toMatchObject({
      shopId: 'shop-fallback',
      name: 'Untitled attribute',
      value: 'No value',
    });
    expect(
      (component as any).mapAttribute(
        { id: 'attr-2', shopId: 'shop-2', name: 'Size', value: 'M' },
        'fallback',
      ),
    ).toMatchObject({
      id: 'attr-2',
      shopId: 'shop-2',
      name: 'Size',
      value: 'M',
    });
  });
});
