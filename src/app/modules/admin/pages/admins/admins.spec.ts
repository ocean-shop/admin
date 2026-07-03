import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { Admins } from './admins';
import { AdminsService } from './services/admins.service';
import { AdminsApiResponse } from './models/admin.model';

describe('Admins', () => {
  let fixture: ComponentFixture<Admins>;
  let component: Admins;
  let mockAdminsService: { getAdmins: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const adminsResponse: AdminsApiResponse = {
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
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    mockAdminsService = {
      getAdmins: vi.fn().mockReturnValue(of(adminsResponse)),
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
    expect(pageElement.textContent).toContain('Unknown administrator');
    expect(pageElement.textContent).toContain('kukulyak.taras@gmail.com');
    expect(pageElement.textContent).toContain('No phone');
    expect(pageElement.textContent).toContain('super');
  });
});
