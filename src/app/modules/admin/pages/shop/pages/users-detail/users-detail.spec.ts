import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { UsersService } from '../users/services/users.service';
import { UsersDetail } from './users-detail';

describe('UsersDetail', () => {
  let fixture: ComponentFixture<UsersDetail>;
  let component: UsersDetail;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockUsersService: {
    getUserById: ReturnType<typeof vi.fn>;
  };
  const flush = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1', userId: 'user-1' }));
    mockUsersService = {
      getUserById: vi.fn().mockReturnValue(
        of({
          id: 'user-1',
          email: 'john@example.com',
          phoneNumber: '+380991112233',
          isActive: true,
          createdAt: '2026-08-10T11:12:13.000Z',
          otps: [{ channel: 'email', purpose: 'login', attempts: 1 }],
          sessions: [
            {
              userAgent: 'Mozilla/5.0',
              ipAddress: '127.0.0.1',
              deviceName: 'Desktop',
            },
          ],
          role: { name: 'customer', code: 'customer' },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [UsersDetail],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: UsersService, useValue: mockUsersService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ shopId: 'shop-1', userId: 'user-1' }),
            },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersDetail);
    component = fixture.componentInstance;
    await flush();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads user by current id', () => {
    expect(mockUsersService.getUserById).toHaveBeenCalledWith('user-1');
  });

  it('renders user sections data', async () => {
    await flush();
    expect((component as any).userInfoRows().length).toBeGreaterThan(0);
    expect((component as any).otpRows()).toHaveLength(1);
    expect((component as any).sessionRows()).toHaveLength(1);
    expect((component as any).roleRows().length).toBeGreaterThan(0);
  });
});
