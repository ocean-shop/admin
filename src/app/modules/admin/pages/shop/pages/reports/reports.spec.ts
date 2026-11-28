import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import Highcharts from 'highcharts';
import { BehaviorSubject, of } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { REPORTS_TEXTS } from './constants/reports.constants';
import { buildPresetPeriod } from './helpers/report-period/report-period.helper';
import { Reports } from './reports';
import { FinanceReportsService } from './services/finance-reports/finance-reports.service';

describe('Reports', () => {
  let fixture: ComponentFixture<Reports>;
  let element: HTMLElement;
  let queryParamMap$: BehaviorSubject<ParamMap>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockService: {
    getRevenueReport: ReturnType<typeof vi.fn>;
    getProductReport: ReturnType<typeof vi.fn>;
    getCustomerReport: ReturnType<typeof vi.fn>;
    getQuickOrderReport: ReturnType<typeof vi.fn>;
  };

  const setup = async (shopId: string | null = 'shop-1', tab: string | null = null) => {
    const params = convertToParamMap(shopId ? { shopId } : {});
    const queryParams = convertToParamMap(tab ? { tab } : {});
    queryParamMap$ = new BehaviorSubject(queryParams);

    await TestBed.configureTestingModule({
      imports: [Reports],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: FinanceReportsService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: params, queryParamMap: queryParams },
            paramMap: new BehaviorSubject(params).asObservable(),
            queryParamMap: queryParamMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Reports);
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    vi.spyOn(Highcharts, 'chart').mockReturnValue({
      update: vi.fn(),
      destroy: vi.fn(),
    } as unknown as Highcharts.Chart);
    mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
    mockService = {
      getRevenueReport: vi.fn().mockReturnValue(of({ summary: {} })),
      getProductReport: vi
        .fn()
        .mockReturnValue(
          of({ topProducts: [{ productId: 'p-1', name: 'Iphone', abcClass: 'A' }] }),
        ),
      getCustomerReport: vi.fn().mockReturnValue(of({ summary: {} })),
      getQuickOrderReport: vi
        .fn()
        .mockReturnValue(
          of({ summary: {}, topProducts: [{ productId: 'p-2', name: 'Чохол', requestsCount: 2 }] }),
        ),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the revenue tab for the current month by default', async () => {
    await setup();

    expect(element.querySelector('app-page-header')?.textContent).toContain(
      REPORTS_TEXTS.PAGE_TITLE,
    );
    expect(element.querySelector('app-revenue-report')).not.toBeNull();
    expect(element.querySelector('.tab-active')?.textContent).toContain('Виручка');
    expect(mockService.getRevenueReport).toHaveBeenCalledWith({
      shopId: 'shop-1',
      ...buildPresetPeriod('thisMonth'),
    });
    expect(mockService.getProductReport).not.toHaveBeenCalled();
  });

  it.each([
    ['products', 'app-product-report'],
    ['customers', 'app-customer-report'],
    ['quickOrders', 'app-quick-order-report'],
    ['unknown', 'app-revenue-report'],
  ])('renders the %s tab from the query param', async (tab, selector) => {
    await setup('shop-1', tab);

    expect(element.querySelector(selector)).not.toBeNull();
  });

  it('follows query param changes', async () => {
    await setup();

    queryParamMap$.next(convertToParamMap({ tab: 'customers' }));
    await flushQueries(fixture);

    expect(element.querySelector('app-customer-report')).not.toBeNull();
    expect(mockService.getCustomerReport).toHaveBeenCalled();
  });

  it('writes the selected tab into the URL', async () => {
    await setup();

    element.querySelectorAll<HTMLButtonElement>('.tab')[1].click();

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { tab: 'products' },
      queryParamsHandling: 'merge',
    });
  });

  it('passes a new period to the active tab', async () => {
    await setup();

    (element.querySelector('input[value="previousMonth"]') as HTMLInputElement).click();
    await flushQueries(fixture);

    expect(mockService.getRevenueReport).toHaveBeenLastCalledWith({
      shopId: 'shop-1',
      ...buildPresetPeriod('previousMonth'),
    });
  });

  it('navigates to shop orders and products', async () => {
    await setup('shop-1', 'products');

    (element.querySelector('.report-table-link') as HTMLButtonElement).click();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      APP_ROUTES.ADMIN_SHOP,
      'shop-1',
      'products',
      'p-1',
    ]);

    (fixture.componentInstance as any).onOpenOrders();
    expect(mockRouter.navigate).toHaveBeenLastCalledWith([
      APP_ROUTES.ADMIN_SHOP,
      'shop-1',
      'orders',
    ]);
  });

  it('navigates to the product and quick orders from the quick orders tab', async () => {
    await setup('shop-1', 'quickOrders');

    expect(mockService.getQuickOrderReport).toHaveBeenCalledWith({
      shopId: 'shop-1',
      ...buildPresetPeriod('thisMonth'),
    });

    (element.querySelector('.report-table-link') as HTMLButtonElement).click();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      APP_ROUTES.ADMIN_SHOP,
      'shop-1',
      'products',
      'p-2',
    ]);

    (element.querySelector('.highlight-link') as HTMLButtonElement).click();
    expect(mockRouter.navigate).toHaveBeenLastCalledWith([
      APP_ROUTES.ADMIN_SHOP,
      'shop-1',
      'quick-orders',
    ]);
  });

  it('shows a warning and does not navigate without a shop id', async () => {
    await setup(null);

    expect(element.textContent).toContain(REPORTS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    expect(element.querySelector('app-tabs')).toBeNull();

    (fixture.componentInstance as any).onOpenProduct('p-1');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
