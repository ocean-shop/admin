import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Shop } from './shop';
import { ShopsService } from './services/shops.service';
import { ShopsApiResponse } from './models/shop.model';
import { SHOPS_TEXTS } from './constants/shops.constants';

describe('Shop', () => {
  let fixture: ComponentFixture<Shop>;
  let component: Shop;
  let mockShopsService: {
    getShops: ReturnType<typeof vi.fn>;
    createShop: ReturnType<typeof vi.fn>;
    updateShop: ReturnType<typeof vi.fn>;
    deleteShop: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: { success: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const firstPageResponse: ShopsApiResponse = {
      items: [
        {
          id: 'shop-1',
          name: 'Ocean Shop',
          description: 'Main warehouse shop',
          url: 'https://ocean-shop.example/main',
          created: '2026-01-01T10:00:00Z',
          updated: '2026-01-02T10:00:00Z',
        },
      ],
      total: 12,
      page: 1,
      limit: 10,
      totalPages: 2,
    };

    const secondPageResponse: ShopsApiResponse = {
      items: [
        {
          id: 'shop-2',
          name: 'Coast Shop',
          description: 'Secondary shop',
          url: 'https://ocean-shop.example/coast',
          created: '2026-01-03T10:00:00Z',
          updated: '2026-01-04T10:00:00Z',
        },
      ],
      total: 12,
      page: 2,
      limit: 10,
      totalPages: 2,
    };

    mockShopsService = {
      getShops: vi
        .fn()
        .mockReturnValueOnce(of(firstPageResponse))
        .mockReturnValue(of(secondPageResponse)),
      createShop: vi.fn().mockReturnValue(of({ id: 'created-shop' })),
      updateShop: vi.fn().mockReturnValue(of({ id: 'updated-shop' })),
      deleteShop: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ShopsService, useValue: mockShopsService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders page title and create action', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(SHOPS_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(SHOPS_TEXTS.CREATE_LABEL);
  });

  it('renders shops list from API', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(mockShopsService.getShops).toHaveBeenCalledTimes(1);
    expect(mockShopsService.getShops).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(pageElement.textContent).toContain('Ocean Shop');
    expect(pageElement.textContent).toContain('Main warehouse shop');
    expect(pageElement.textContent).toContain('https://ocean-shop.example/main');
  });

  it('renders pagination summary from API metadata', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(
      `Showing 1 to 10 of 12 ${SHOPS_TEXTS.PAGINATION_LABEL}`,
    );
  });

  it('requests selected page when pagination page is clicked', async () => {
    const pageButtons = fixture.debugElement.queryAll(By.css('.pagination-page-button'));
    const secondPageButton = pageButtons.find(
      (button) => (button.nativeElement as HTMLButtonElement).textContent?.trim() === '2',
    );

    secondPageButton?.triggerEventHandler('click');
    await fixture.whenStable();

    expect(mockShopsService.getShops).toHaveBeenNthCalledWith(2, { page: 2, limit: 10 });
  });

  it('creates shop and refreshes list after success', () => {
    (component as any).onCreateShop();
    (component as any).onConfirmFormModal({
      name: 'Atlantic Shop',
      description: 'Atlantic warehouse',
      url: 'https://ocean-shop.example/atlantic',
    });

    expect(mockShopsService.createShop).toHaveBeenCalledWith({
      name: 'Atlantic Shop',
      description: 'Atlantic warehouse',
      url: 'https://ocean-shop.example/atlantic',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(SHOPS_TEXTS.CREATE_SUCCESS_TITLE);
    expect(mockShopsService.getShops).toHaveBeenCalledTimes(2);
  });

  it('updates selected shop and refreshes list after success', () => {
    const shop = (component as any).shops()[0];
    (component as any).selectedShop.set(shop);
    (component as any).modalMode.set('update');
    (component as any).onConfirmFormModal({
      name: 'Ocean Shop Updated',
      description: 'Updated description',
      url: 'https://ocean-shop.example/main-updated',
    });

    expect(mockShopsService.updateShop).toHaveBeenCalledWith(shop.id, {
      name: 'Ocean Shop Updated',
      description: 'Updated description',
      url: 'https://ocean-shop.example/main-updated',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(SHOPS_TEXTS.UPDATE_SUCCESS_TITLE);
    expect(mockShopsService.getShops).toHaveBeenCalledTimes(2);
  });

  it('deletes selected shop and refreshes list after success', () => {
    const shop = (component as any).shops()[0];
    (component as any).selectedShop.set(shop);
    (component as any).modalMode.set('delete');

    (component as any).onConfirmDelete();

    expect(mockShopsService.deleteShop).toHaveBeenCalledWith(shop.id);
    expect(mockToasterService.success).toHaveBeenCalledWith(SHOPS_TEXTS.DELETE_SUCCESS_TITLE);
    expect(mockShopsService.getShops).toHaveBeenCalledTimes(2);
  });
});
