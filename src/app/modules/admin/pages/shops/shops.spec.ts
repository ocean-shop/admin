import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOPS_PAGE_SIZE, SHOPS_TEXTS } from './constants/shops.constants';
import { ShopModalModeEnum } from './models/shop-modal-mode.type';
import { ShopsApiResponse } from './models/shop.model';
import { ShopsService } from './services/shops/shops.service';
import { Shops } from './shops';

const buildPage = (id: string, page: number): ShopsApiResponse => ({
  items: [{ id, name: `Shop ${id}`, description: 'Desc', url: 'https://shop.test' }],
  total: 12,
  page,
  limit: SHOPS_PAGE_SIZE,
  totalPages: 2,
});

describe('Shops', () => {
  let fixture: ComponentFixture<Shops>;
  let component: Shops;
  let element: HTMLElement;
  let shopsService: {
    getShops: ReturnType<typeof vi.fn>;
    createShop: ReturnType<typeof vi.fn>;
    updateShop: ReturnType<typeof vi.fn>;
    deleteShop: ReturnType<typeof vi.fn>;
  };
  let toaster: { success: ReturnType<typeof vi.fn> };

  const card = { id: 'shop-1', title: '', subtitle: '', detail: '', badge: '' };

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(Shops);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    await flushQueries(fixture);
  };

  beforeEach(async () => {
    shopsService = {
      getShops: vi
        .fn()
        .mockImplementation(({ page }: { page: number }) => of(buildPage(`shop-${page}`, page))),
      createShop: vi.fn().mockReturnValue(of({ id: 'shop-3' })),
      updateShop: vi.fn().mockReturnValue(of({ id: 'shop-1' })),
      deleteShop: vi.fn().mockReturnValue(of(undefined)),
    };
    toaster = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Shops],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...provideTestQueryClient(),
        { provide: ShopsService, useValue: shopsService },
        { provide: ToasterService, useValue: toaster },
      ],
    }).compileComponents();
  });

  describe('with shops', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('renders the first page of shops with pagination', () => {
      expect(shopsService.getShops).toHaveBeenCalledWith({ page: 1, limit: SHOPS_PAGE_SIZE });
      expect(element.querySelectorAll('app-entity-card')).toHaveLength(1);
      expect(element.textContent).toContain('Shop shop-1');
      expect(element.querySelector('app-pagination')).not.toBeNull();
    });

    it('links the shop name to the shop detail page', () => {
      const link = element.querySelector('.entity-title-link') as HTMLAnchorElement;

      expect(link.textContent?.trim()).toBe('Shop shop-1');
      expect(link.getAttribute('href')).toBe(`${APP_ROUTES.ADMIN_SHOP}/shop-1`);
    });

    it('loads another page and ignores impossible page changes', async () => {
      (component as any).onPageChange(2);
      await flushQueries(fixture);
      (component as any).onPageChange(5);

      expect(shopsService.getShops).toHaveBeenLastCalledWith({ page: 2, limit: SHOPS_PAGE_SIZE });
      expect((component as any).currentPage()).toBe(2);
    });

    it('creates a shop, toasts and refetches', async () => {
      (component as any).onCreateShop();
      (component as any).onConfirmFormModal({ name: 'New' });
      await flushQueries(fixture);

      expect(shopsService.createShop).toHaveBeenCalledWith({ name: 'New' });
      expect(toaster.success).toHaveBeenCalledWith(SHOPS_TEXTS.CREATE_SUCCESS_TITLE);
      expect((component as any).modalMode()).toBeNull();
      expect(shopsService.getShops).toHaveBeenCalledTimes(2);
    });

    it('updates the selected shop', async () => {
      (component as any).onEditShop(card);
      expect((component as any).formModalMode()).toBe(ShopModalModeEnum.Update);

      (component as any).onConfirmFormModal({ name: 'Renamed' });
      await flushQueries(fixture);

      expect(shopsService.updateShop).toHaveBeenCalledWith('shop-1', { name: 'Renamed' });
      expect(toaster.success).toHaveBeenCalledWith(SHOPS_TEXTS.UPDATE_SUCCESS_TITLE);
    });

    it('deletes the selected shop', async () => {
      (component as any).onDeleteShop(card);
      expect((component as any).isDeleteModalOpen()).toBe(true);
      expect((component as any).selectedShopName()).toBe('Shop shop-1');

      (component as any).onConfirmDelete();
      await flushQueries(fixture);

      expect(shopsService.deleteShop).toHaveBeenCalledWith('shop-1');
      expect(toaster.success).toHaveBeenCalledWith(SHOPS_TEXTS.DELETE_SUCCESS_TITLE);
    });

    it('goes back a page after deleting the last shop of a page', async () => {
      (component as any).onPageChange(2);
      await flushQueries(fixture);
      (component as any).onDeleteShop({ ...card, id: 'shop-2' });

      (component as any).onConfirmDelete();
      await flushQueries(fixture);

      expect((component as any).currentPage()).toBe(1);
    });

    it('ignores cards of unknown shops and confirm without a selection', () => {
      (component as any).onEditShop({ ...card, id: 'unknown' });
      (component as any).onConfirmDelete();

      expect((component as any).modalMode()).toBeNull();
      expect(shopsService.deleteShop).not.toHaveBeenCalled();
    });

    it('keeps the modal open when the request fails', async () => {
      shopsService.createShop.mockReturnValueOnce(throwError(() => new Error('boom')));
      (component as any).onCreateShop();

      (component as any).onConfirmFormModal({ name: 'New' });
      await flushQueries(fixture);

      expect((component as any).modalMode()).toBe(ShopModalModeEnum.Create);
      expect(toaster.success).not.toHaveBeenCalled();
    });

    it('closes the modal on cancel', () => {
      (component as any).onCreateShop();
      (component as any).onCloseModal();

      expect((component as any).isFormModalOpen()).toBe(false);
    });
  });

  it('shows the empty state', async () => {
    shopsService.getShops.mockReturnValue(of([]));

    await createComponent();

    expect(element.textContent).toContain(SHOPS_TEXTS.EMPTY_STATE);
    expect(element.querySelector('app-pagination')).toBeNull();
  });

  it('shows the error state', async () => {
    shopsService.getShops.mockReturnValue(throwError(() => new Error('boom')));

    await createComponent();

    expect(element.textContent).toContain(SHOPS_TEXTS.LOAD_ERROR_MESSAGE);
  });
});
