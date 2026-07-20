import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Admins } from './admins';
import { AdminsService } from './services/admins.service';
import { AdminsApiResponse } from './models/admin.model';
import { ADMINS_TEXTS } from './constants/admins.constants';
import { ShopsService } from '../shops/services/shops.service';
import { ShopsApiResponse } from '../shops/models/shop.model';

describe('Admins', () => {
  let fixture: ComponentFixture<Admins>;
  let component: Admins;
  let mockAdminsService: {
    getAdmins: ReturnType<typeof vi.fn>;
    createAdmin: ReturnType<typeof vi.fn>;
    updateAdmin: ReturnType<typeof vi.fn>;
    deleteAdmin: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: { success: ReturnType<typeof vi.fn> };
  let mockShopsService: { getShops: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const firstPageResponse: AdminsApiResponse = {
      items: [
        {
          id: 'a817f770-4569-4080-b9c9-3eb364f15774',
          email: 'kukulyak.taras@gmail.com',
          mobileNumber: null,
          role: {
            id: 'aad1f9ef-2ef2-45ba-9b70-1a3b09d1480f',
            name: 'super',
            description: 'Super user',
          },
        },
      ],
      total: 12,
      page: 1,
      limit: 10,
      totalPages: 2,
    };

    const secondPageResponse: AdminsApiResponse = {
      items: [
        {
          id: '6f3097a3-1173-4e95-b5eb-2a23d635779f',
          email: 'second.page@ocean-shop.com',
          mobileNumber: '+1 (555) 019-7777',
          role: 'admin',
        },
      ],
      total: 12,
      page: 2,
      limit: 10,
      totalPages: 2,
    };

    mockAdminsService = {
      getAdmins: vi
        .fn()
        .mockReturnValueOnce(of(firstPageResponse))
        .mockReturnValue(of(secondPageResponse)),
      createAdmin: vi.fn().mockReturnValue(of({ id: 'created-admin' })),
      updateAdmin: vi.fn().mockReturnValue(of({ id: 'updated-admin' })),
      deleteAdmin: vi.fn().mockReturnValue(of(void 0)),
    };
    mockToasterService = {
      success: vi.fn(),
    };
    const shopsResponse: ShopsApiResponse = {
      items: [
        { id: 'shop-1', name: 'Shop One' },
        { id: 'shop-2', name: 'Shop Two' },
      ],
      total: 2,
      page: 1,
      limit: 100,
      totalPages: 1,
    };
    mockShopsService = {
      getShops: vi.fn().mockReturnValue(of(shopsResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [Admins],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AdminsService, useValue: mockAdminsService },
        { provide: ShopsService, useValue: mockShopsService },
        { provide: ToasterService, useValue: mockToasterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Admins);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders page title and create action', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(ADMINS_TEXTS.PAGE_TITLE);
    expect(pageElement.textContent).toContain(ADMINS_TEXTS.CREATE_LABEL);
  });

  it('renders administrators list from API', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(mockAdminsService.getAdmins).toHaveBeenCalledTimes(1);
    expect(mockAdminsService.getAdmins).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(mockShopsService.getShops).toHaveBeenCalledWith({ page: 1, limit: 100 });
    expect(pageElement.textContent).toContain(ADMINS_TEXTS.DEFAULT_NAME);
    expect(pageElement.textContent).toContain('kukulyak.taras@gmail.com');
    expect(pageElement.textContent).toContain(ADMINS_TEXTS.DEFAULT_PHONE);
    expect(pageElement.textContent).toContain('super');
  });

  it('renders pagination summary from API metadata', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(
      `Showing 1 to 10 of 12 ${ADMINS_TEXTS.PAGINATION_LABEL}`,
    );
  });

  it('requests selected page when pagination page is clicked', async () => {
    const pageButtons = fixture.debugElement.queryAll(By.css('.pagination-page-button'));
    const secondPageButton = pageButtons.find(
      (button) => (button.nativeElement as HTMLButtonElement).textContent?.trim() === '2',
    );

    secondPageButton?.triggerEventHandler('click');
    await fixture.whenStable();

    expect(mockAdminsService.getAdmins).toHaveBeenNthCalledWith(2, { page: 2, limit: 10 });
  });

  it('creates admin and refreshes list after success', () => {
    (component as any).onCreateAdmin();
    (component as any).onConfirmFormModal({ email: 'new.admin@ocean-shop.com', role: 'admin' });

    expect(mockAdminsService.createAdmin).toHaveBeenCalledWith({
      email: 'new.admin@ocean-shop.com',
      role: 'admin',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(ADMINS_TEXTS.CREATE_SUCCESS_TITLE);
    expect(mockAdminsService.getAdmins).toHaveBeenCalledTimes(2);
  });

  it('updates selected admin and refreshes list after success', () => {
    const admin = (component as any).admins()[0];
    (component as any).onEditAdmin(admin);
    (component as any).onConfirmFormModal({ mobileNumber: '1234567890', role: 'super' });

    expect(mockAdminsService.updateAdmin).toHaveBeenCalledWith(admin.id, {
      mobileNumber: '1234567890',
      role: 'super',
    });
    expect(mockToasterService.success).toHaveBeenCalledWith(ADMINS_TEXTS.UPDATE_SUCCESS_TITLE);
    expect(mockAdminsService.getAdmins).toHaveBeenCalledTimes(2);
  });

  it('deletes selected admin and refreshes list after success', () => {
    const admin = (component as any).admins()[0];
    (component as any).onDeleteAdmin(admin);

    (component as any).onConfirmDelete();

    expect(mockAdminsService.deleteAdmin).toHaveBeenCalledWith(admin.id);
    expect(mockToasterService.success).toHaveBeenCalledWith(ADMINS_TEXTS.DELETE_SUCCESS_TITLE);
    expect(mockAdminsService.getAdmins).toHaveBeenCalledTimes(2);
  });
});
