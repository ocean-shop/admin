import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOPS_ALL_PAGE_SIZE } from '../shops/constants/shops.constants';
import { ShopsService } from '../shops/services/shops.service';
import { Admins } from './admins';
import { ADMINS_PAGE_SIZE, ADMINS_TEXTS } from './constants/admins.constants';
import { AdminModalModeEnum } from './models/admin-modal-mode.type';
import { AdminsApiResponse } from './models/admin.model';
import { AdminsService } from './services/admins.service';

const buildPage = (id: string, page: number): AdminsApiResponse => ({
  items: [{ id, fullName: `Admin ${id}`, email: `${id}@ocean.dev`, role: 'admin' }],
  total: 12,
  page,
  limit: ADMINS_PAGE_SIZE,
  totalPages: 2,
});

describe('Admins', () => {
  let fixture: ComponentFixture<Admins>;
  let component: Admins;
  let element: HTMLElement;
  let adminsService: {
    getAdmins: ReturnType<typeof vi.fn>;
    createAdmin: ReturnType<typeof vi.fn>;
    updateAdmin: ReturnType<typeof vi.fn>;
    deleteAdmin: ReturnType<typeof vi.fn>;
  };
  let shopsService: { getAllShops: ReturnType<typeof vi.fn> };
  let toaster: { success: ReturnType<typeof vi.fn> };

  const card = { id: 'admin-1', title: '', subtitle: '', detail: '', badge: '' };
  const payload = { email: 'new@ocean.dev', role: 'admin', shopIds: [] };

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(Admins);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    await flushQueries(fixture);
  };

  beforeEach(async () => {
    adminsService = {
      getAdmins: vi
        .fn()
        .mockImplementation(({ page }: { page: number }) => of(buildPage(`admin-${page}`, page))),
      createAdmin: vi.fn().mockReturnValue(of({ id: 'admin-3' })),
      updateAdmin: vi.fn().mockReturnValue(of({ id: 'admin-1' })),
      deleteAdmin: vi.fn().mockReturnValue(of(undefined)),
    };
    shopsService = {
      getAllShops: vi.fn().mockReturnValue(of([{ id: 'shop-1', name: 'Ocean' }])),
    };
    toaster = { success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Admins],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: AdminsService, useValue: adminsService },
        { provide: ShopsService, useValue: shopsService },
        { provide: ToasterService, useValue: toaster },
      ],
    }).compileComponents();
  });

  describe('with admins', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('renders admins, pagination and loads shop options', () => {
      expect(adminsService.getAdmins).toHaveBeenCalledWith({ page: 1, limit: ADMINS_PAGE_SIZE });
      expect(element.querySelectorAll('app-entity-card')).toHaveLength(1);
      expect(element.textContent).toContain('Admin admin-1');
      expect(element.querySelector('app-pagination')).not.toBeNull();
      expect(shopsService.getAllShops).toHaveBeenCalledWith(SHOPS_ALL_PAGE_SIZE);
      expect((component as any).shopOptions()).toEqual([{ value: 'shop-1', label: 'Ocean' }]);
    });

    it('changes pages within bounds', async () => {
      (component as any).onPageChange(2);
      await flushQueries(fixture);
      (component as any).onPageChange(0);

      expect(adminsService.getAdmins).toHaveBeenLastCalledWith({
        page: 2,
        limit: ADMINS_PAGE_SIZE,
      });
      expect((component as any).currentPage()).toBe(2);
    });

    it('creates an admin, toasts and refetches', async () => {
      (component as any).onCreateAdmin();
      (component as any).onConfirmFormModal(payload);
      await flushQueries(fixture);

      expect(adminsService.createAdmin).toHaveBeenCalledWith(payload);
      expect(toaster.success).toHaveBeenCalledWith(ADMINS_TEXTS.CREATE_SUCCESS_TITLE);
      expect((component as any).modalMode()).toBeNull();
      expect(adminsService.getAdmins).toHaveBeenCalledTimes(2);
    });

    it('updates the selected admin', async () => {
      (component as any).onEditAdmin(card);
      expect((component as any).formModalMode()).toBe(AdminModalModeEnum.Update);

      (component as any).onConfirmFormModal(payload);
      await flushQueries(fixture);

      expect(adminsService.updateAdmin).toHaveBeenCalledWith('admin-1', payload);
      expect(toaster.success).toHaveBeenCalledWith(ADMINS_TEXTS.UPDATE_SUCCESS_TITLE);
    });

    it('deletes the selected admin and steps back from an emptied page', async () => {
      (component as any).onPageChange(2);
      await flushQueries(fixture);
      (component as any).onDeleteAdmin({ ...card, id: 'admin-2' });
      expect((component as any).selectedAdminName()).toBe('Admin admin-2');

      (component as any).onConfirmDelete();
      await flushQueries(fixture);

      expect(adminsService.deleteAdmin).toHaveBeenCalledWith('admin-2');
      expect(toaster.success).toHaveBeenCalledWith(ADMINS_TEXTS.DELETE_SUCCESS_TITLE);
      expect((component as any).currentPage()).toBe(1);
    });

    it('ignores unknown cards and confirms without a selection', () => {
      (component as any).onDeleteAdmin({ ...card, id: 'unknown' });
      (component as any).onConfirmDelete();

      expect((component as any).selectedAdminName()).toBe('');
      expect(adminsService.deleteAdmin).not.toHaveBeenCalled();
    });

    it('keeps the modal open when the request fails', async () => {
      adminsService.updateAdmin.mockReturnValueOnce(throwError(() => new Error('boom')));
      (component as any).onEditAdmin(card);

      (component as any).onConfirmFormModal(payload);
      await flushQueries(fixture);

      expect((component as any).modalMode()).toBe(AdminModalModeEnum.Update);
      expect(toaster.success).not.toHaveBeenCalled();
    });

    it('closes the modal on cancel', () => {
      (component as any).onCreateAdmin();
      (component as any).onCloseModal();

      expect((component as any).isFormModalOpen()).toBe(false);
    });
  });

  it('shows the empty state', async () => {
    adminsService.getAdmins.mockReturnValue(of({ items: [] }));

    await createComponent();

    expect(element.textContent).toContain(ADMINS_TEXTS.EMPTY_STATE);
  });

  it('shows the error state', async () => {
    adminsService.getAdmins.mockReturnValue(throwError(() => new Error('boom')));

    await createComponent();

    expect(element.textContent).toContain(ADMINS_TEXTS.LOAD_ERROR_MESSAGE);
  });
});
