import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { USERS_TEXTS } from './constants/users.constants';
import { UserListResponse } from './models/user.model';
import { Users } from './users';
import { UsersService } from './services/users.service';

describe('Users', () => {
  let fixture: ComponentFixture<Users>;
  let component: Users;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockUsersService: {
    getUsers: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  const flush = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    const response: UserListResponse = {
      items: [
        {
          id: 'user-1',
          email: 'john@example.com',
          phoneNumber: '+380991112233',
          isActive: true,
          createdAt: '2026-08-10T11:12:13.000Z',
        },
      ],
      total: 25,
      page: 1,
      limit: 20,
      totalPages: 2,
    };

    mockUsersService = {
      getUsers: vi.fn().mockReturnValue(of(response)),
    };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: UsersService, useValue: mockUsersService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    await flush();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders breadcrumbs for shop page', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Головна');
    expect(element.textContent).toContain(USERS_TEXTS.PAGE_TITLE);
  });

  it('requests users list with default params', () => {
    expect(mockUsersService.getUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortOrder: 'desc',
    });
  });

  it('maps user rows for table columns', async () => {
    await flush();
    const rows = (component as any).userRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]['email']).toBe('john@example.com');
    expect(rows[0]['mobile_number']).toBe('+380991112233');
    expect(rows[0]['is_active']).toBe('true');
  });

  it('navigates to user details on show action', () => {
    (component as any).onShowUser({ id: 'user-1' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/shop', 'shop-1', 'users', 'user-1']);
  });

  it('changes page and requests next result set', async () => {
    (component as any).onPageChange(2);
    await flush();

    expect(mockUsersService.getUsers).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20,
      shopId: 'shop-1',
      sortOrder: 'desc',
    });
  });

  it('applies email and phone filters', async () => {
    (component as any).emailInput.set('john@example.com');
    (component as any).phoneNumberInput.set('+380991112233');
    (component as any).onApplyFilters();
    await flush();

    expect(mockUsersService.getUsers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      email: 'john@example.com',
      phoneNumber: '+380991112233',
      sortOrder: 'desc',
    });
  });

  it('changes sorting to older date first', async () => {
    (component as any).onSortSelected({ label: 'old', value: 'older' });
    await flush();

    expect(mockUsersService.getUsers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortOrder: 'asc',
    });
  });
});
