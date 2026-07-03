import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { Admins } from './admins';
import { AdminsService } from './services/admins.service';
import { AdminsApiResponse } from './models/admin.model';

describe('Admins', () => {
  let fixture: ComponentFixture<Admins>;
  let component: Admins;
  let mockAdminsService: { getAdmins: ReturnType<typeof vi.fn> };

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
    };

    await TestBed.configureTestingModule({
      imports: [Admins],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AdminsService, useValue: mockAdminsService },
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

    expect(pageElement.textContent).toContain('Administrators');
    expect(pageElement.textContent).toContain('Create Admin');
  });

  it('renders administrators list from API', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(mockAdminsService.getAdmins).toHaveBeenCalledTimes(1);
    expect(mockAdminsService.getAdmins).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(pageElement.textContent).toContain('Unknown administrator');
    expect(pageElement.textContent).toContain('kukulyak.taras@gmail.com');
    expect(pageElement.textContent).toContain('No phone');
    expect(pageElement.textContent).toContain('super');
  });

  it('renders pagination summary from API metadata', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain('Showing 1 to 10 of 12 admins');
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
});
