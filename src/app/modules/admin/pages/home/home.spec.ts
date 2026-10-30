import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { AuthService } from '@core/services/auth/auth.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { AdminsService } from '../admins/services/admins/admins.service';
import { ShopStatisticService } from '../shop/services/shop-statistic/shop-statistic.service';
import { HOME_TEXTS } from './constants/home.constants';
import { Home } from './home';

describe('Home', () => {
  let mockAdminsService: { getAdminById: ReturnType<typeof vi.fn> };
  let mockStatisticService: { getStatistic: ReturnType<typeof vi.fn> };
  let mockAuthService: { getUserId: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const createComponent = async () => {
    const fixture = TestBed.createComponent(Home);
    await flushQueries(fixture);
    return fixture;
  };

  beforeEach(async () => {
    mockAdminsService = { getAdminById: vi.fn().mockReturnValue(of({ shops: [] })) };
    mockStatisticService = {
      getStatistic: vi.fn().mockReturnValue(of({ orders: [], products: [], users: [] })),
    };
    mockAuthService = { getUserId: vi.fn().mockReturnValue('admin-1') };
    mockRouter = { navigate: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: AdminsService, useValue: mockAdminsService },
        { provide: ShopStatisticService, useValue: mockStatisticService },
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
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(HOME_TEXTS.EMPTY_STATE);
  });

  it('renders a card per assigned shop', async () => {
    mockAdminsService.getAdminById.mockReturnValue(
      of({ shops: [{ id: 's1', name: 'Alpha' }, 's2'] }),
    );

    const fixture = await createComponent();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('app-shop-overview-card')).toHaveLength(2);
  });

  it('loads the statistic of every shop and shows total sales and products', async () => {
    mockAdminsService.getAdminById.mockReturnValue(of({ shops: [{ id: 's1', name: 'Alpha' }] }));
    mockStatisticService.getStatistic.mockReturnValue(
      of({
        orders: [
          { year: 2026, month: 'January', monthNumber: 1, count: 2 },
          { year: 2026, month: 'February', monthNumber: 2, count: 3 },
        ],
        products: [{ year: 2026, month: 'January', monthNumber: 1, count: 12 }],
        users: [],
      }),
    );

    const fixture = await createComponent();
    await flushQueries(fixture);
    const values = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.metric-value'),
    ).map((element) => element.textContent?.trim());

    expect(mockStatisticService.getStatistic).toHaveBeenCalledWith('s1');
    expect(values).toEqual(['5', '12']);
  });

  it('keeps metrics pending when the statistic fails to load', async () => {
    mockAdminsService.getAdminById.mockReturnValue(of({ shops: [{ id: 's1', name: 'Alpha' }] }));
    mockStatisticService.getStatistic.mockReturnValue(throwError(() => new Error('fail')));

    const fixture = await createComponent();
    await flushQueries(fixture);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      HOME_TEXTS.METRIC_PENDING_TEXT,
    );
  });

  it('shows the error state when loading fails', async () => {
    mockAdminsService.getAdminById.mockReturnValue(throwError(() => new Error('fail')));

    const fixture = await createComponent();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      HOME_TEXTS.LOAD_ERROR_MESSAGE,
    );
    expect((fixture.componentInstance as any).cards()).toEqual([]);
  });

  it('navigates to shop page on manage store', async () => {
    const fixture = await createComponent();

    (fixture.componentInstance as any).onManageStore('s1');

    expect(mockRouter.navigate).toHaveBeenCalledWith([APP_ROUTES.ADMIN_SHOP, 's1']);
  });
});
