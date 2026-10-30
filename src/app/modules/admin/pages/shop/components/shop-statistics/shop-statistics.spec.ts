import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryClient } from '@tanstack/angular-query-experimental';
import Highcharts from 'highcharts';
import { of, throwError } from 'rxjs';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { SHOP_STATISTICS_TEXTS } from '../../constants/shop-statistics.constants';
import { ShopStatistic } from '../../models/shop-statistic.model';
import { ShopStatisticService } from '../../services/shop-statistic/shop-statistic.service';
import { ShopStatistics } from './shop-statistics';

describe('ShopStatistics', () => {
  let fixture: ComponentFixture<ShopStatistics>;
  let mockStatisticService: { getStatistic: ReturnType<typeof vi.fn> };
  let chartMock: { update: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> };

  const statistic: ShopStatistic = {
    orders: [
      { year: 2026, month: 'Feb', monthNumber: 2, count: 4 },
      { year: 2025, month: 'Dec', monthNumber: 12, count: 1 },
    ],
    products: [{ year: 2026, month: 'Jan', monthNumber: 1, count: 7 }],
    users: [{ year: 2026, month: 'Feb', monthNumber: 2, count: 2 }],
  };

  const createComponent = async () => {
    fixture = TestBed.createComponent(ShopStatistics);
    fixture.componentRef.setInput('shopId', 'shop-1');
    await flushQueries(fixture);
  };

  beforeEach(async () => {
    chartMock = { update: vi.fn(), destroy: vi.fn() };
    vi.spyOn(Highcharts, 'chart').mockReturnValue(chartMock as unknown as Highcharts.Chart);
    mockStatisticService = { getStatistic: vi.fn().mockReturnValue(of(statistic)) };

    await TestBed.configureTestingModule({
      imports: [ShopStatistics],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: ShopStatisticService, useValue: mockStatisticService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads statistic for shop and builds ordered chart data', async () => {
    await createComponent();

    expect(mockStatisticService.getStatistic).toHaveBeenCalledWith('shop-1');
    expect((fixture.componentInstance as any).chartData()).toEqual({
      categories: ['Dec 2025', 'Jan 2026', 'Feb 2026'],
      orders: [1, 0, 4],
      products: [0, 7, 0],
      users: [0, 0, 2],
    });
  });

  it('renders chart when data is available', async () => {
    await createComponent();

    expect(Highcharts.chart).toHaveBeenCalledTimes(1);
  });

  it('updates existing chart instead of creating a new one', async () => {
    await createComponent();
    mockStatisticService.getStatistic.mockReturnValue(
      of({ ...statistic, users: [{ year: 2026, month: 'Mar', monthNumber: 3, count: 5 }] }),
    );

    await TestBed.inject(QueryClient).invalidateQueries();
    await flushQueries(fixture);

    expect(Highcharts.chart).toHaveBeenCalledTimes(1);
    expect(chartMock.update).toHaveBeenCalled();
  });

  it('destroys chart on component destroy', async () => {
    await createComponent();

    fixture.destroy();

    expect(chartMock.destroy).toHaveBeenCalled();
  });

  it('shows empty state when there is no data', async () => {
    mockStatisticService.getStatistic.mockReturnValue(of({ orders: [], products: [], users: [] }));

    await createComponent();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      SHOP_STATISTICS_TEXTS.EMPTY,
    );
    expect(Highcharts.chart).not.toHaveBeenCalled();
  });

  it('shows error state when request fails', async () => {
    mockStatisticService.getStatistic.mockReturnValue(throwError(() => new Error('fail')));

    await createComponent();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      SHOP_STATISTICS_TEXTS.LOAD_ERROR,
    );
  });
});
