import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import { AdminsService } from '../admins/services/admins.service';
import { HOME_SHOP_ROUTE_PREFIX, HOME_TEXTS } from './constants/home.constants';
import { Home } from './home';

describe('Home', () => {
  let mockAdminsService: { getAdminById: ReturnType<typeof vi.fn> };
  let mockAuthService: { getUserId: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const createComponent = async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
    return fixture;
  };

  beforeEach(async () => {
    mockAdminsService = { getAdminById: vi.fn().mockReturnValue(of({ shops: [] })) };
    mockAuthService = { getUserId: vi.fn().mockReturnValue('admin-1') };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AdminsService, useValue: mockAdminsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  it('renders title and empty state when admin has no shops', async () => {
    const fixture = await createComponent();
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(mockAdminsService.getAdminById).toHaveBeenCalledWith('admin-1');
    expect(text).toContain(HOME_TEXTS.PAGE_TITLE);
    expect(text).toContain(HOME_TEXTS.EMPTY_STATE);
  });

  it('skips loading when user id is missing', async () => {
    mockAuthService.getUserId.mockReturnValue(null);

    const fixture = await createComponent();

    expect(mockAdminsService.getAdminById).not.toHaveBeenCalled();
    expect((fixture.componentInstance as any).isLoading()).toBe(false);
  });

  it('maps, deduplicates and sorts shops into cards', async () => {
    mockAdminsService.getAdminById.mockReturnValue(
      of({
        shops: [
          { id: 's2', name: 'Zeta' },
          { id: 's1', name: 'Alpha' },
          { id: 's1', name: 'Alpha duplicate' },
          { id: 's3', name: '  ' },
          { id: null },
          ' s4 ',
          '',
        ],
      }),
    );

    const fixture = await createComponent();
    const cards = (fixture.componentInstance as any).cards();

    expect(
      cards.map((card: { shopId: string; title: string }) => [card.shopId, card.title]),
    ).toEqual([
      ['s1', 'Alpha duplicate'],
      ['s3', `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} s3`],
      ['s4', `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} s4`],
      ['s2', 'Zeta'],
    ]);
    expect(cards[0].actionLabel).toBe(HOME_TEXTS.MANAGE_SHOP_LABEL);
  });

  it('sets error state when loading fails', async () => {
    mockAdminsService.getAdminById.mockReturnValue(throwError(() => new Error('fail')));

    const fixture = await createComponent();

    expect((fixture.componentInstance as any).hasError()).toBe(true);
    expect((fixture.componentInstance as any).cards()).toEqual([]);
    expect((fixture.componentInstance as any).isLoading()).toBe(false);
  });

  it('navigates to shop page on manage store', async () => {
    const fixture = await createComponent();

    (fixture.componentInstance as any).onManageStore('s1');

    expect(mockRouter.navigate).toHaveBeenCalledWith([HOME_SHOP_ROUTE_PREFIX, 's1']);
  });
});
