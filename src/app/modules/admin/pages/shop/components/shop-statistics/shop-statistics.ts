import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import Highcharts from 'highcharts';
import { lastValueFrom } from 'rxjs';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import {
  SHOP_STATISTICS_SERIES_COLORS,
  SHOP_STATISTICS_TEXTS,
} from '../../constants/shop-statistics.constants';
import { MonthlyStatistic, ShopStatistic } from '../../models/shop-statistic.model';
import { ShopStatisticService } from '../../services/shop-statistic.service';

type ChartData = {
  categories: string[];
  orders: number[];
  products: number[];
  users: number[];
};

@Component({
  selector: 'app-shop-statistics',
  imports: [],
  templateUrl: './shop-statistics.html',
  styleUrl: './shop-statistics.scss',
})
export class ShopStatistics {
  private readonly statisticService = inject(ShopStatisticService);
  private readonly destroyRef = inject(DestroyRef);

  readonly shopId = input.required<string>();

  protected readonly textData = SHOP_STATISTICS_TEXTS;

  private readonly chartContainer = viewChild<ElementRef<HTMLElement>>('chartContainer');
  private chart: Highcharts.Chart | null = null;

  protected readonly statisticQuery = injectQuery(() => {
    const shopId = this.shopId();

    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.statistic(shopId)
        : ['shop', 'statistic', 'missing-shop-id'],
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.statisticService.getStatistic(shopId)),
    };
  });

  protected readonly isLoading = computed(
    () => this.statisticQuery.isPending() || this.statisticQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.statisticQuery.isError());

  private readonly chartData = computed<ChartData>(() =>
    this.buildChartData(this.statisticQuery.data()),
  );

  protected readonly hasData = computed(() => this.chartData().categories.length > 0);

  constructor() {
    effect(() => {
      const container = this.chartContainer()?.nativeElement;
      const data = this.chartData();
      if (!container || data.categories.length === 0) {
        return;
      }

      this.renderChart(container, data);
    });

    this.destroyRef.onDestroy(() => {
      this.chart?.destroy();
      this.chart = null;
    });
  }

  private renderChart(container: HTMLElement, data: ChartData): void {
    const options: Highcharts.Options = {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: { categories: data.categories },
      yAxis: {
        allowDecimals: false,
        min: 0,
        title: { text: this.textData.Y_AXIS_TITLE },
      },
      tooltip: { shared: true },
      legend: { enabled: true },
      plotOptions: { column: { borderRadius: 4 } },
      series: [
        {
          type: 'column',
          name: this.textData.SERIES_ORDERS,
          color: SHOP_STATISTICS_SERIES_COLORS.ORDERS,
          data: data.orders,
        },
        {
          type: 'column',
          name: this.textData.SERIES_PRODUCTS,
          color: SHOP_STATISTICS_SERIES_COLORS.PRODUCTS,
          data: data.products,
        },
        {
          type: 'column',
          name: this.textData.SERIES_USERS,
          color: SHOP_STATISTICS_SERIES_COLORS.USERS,
          data: data.users,
        },
      ],
    };

    if (this.chart) {
      this.chart.update(options, true, true);
      return;
    }

    this.chart = Highcharts.chart(container, options);
  }

  private buildChartData(statistic: ShopStatistic | undefined): ChartData {
    if (!statistic) {
      return { categories: [], orders: [], products: [], users: [] };
    }

    const keys = this.buildOrderedMonthKeys(statistic);
    const orders = this.mapSeries(keys, statistic.orders);
    const products = this.mapSeries(keys, statistic.products);
    const users = this.mapSeries(keys, statistic.users);

    return {
      categories: keys.map((key) => key.label),
      orders,
      products,
      users,
    };
  }

  private buildOrderedMonthKeys(
    statistic: ShopStatistic,
  ): { id: string; label: string; year: number; monthNumber: number }[] {
    const merged = new Map<
      string,
      { id: string; label: string; year: number; monthNumber: number }
    >();

    for (const entry of [...statistic.orders, ...statistic.products, ...statistic.users]) {
      const id = `${entry.year}-${entry.monthNumber}`;
      if (!merged.has(id)) {
        merged.set(id, {
          id,
          label: `${entry.month} ${entry.year}`,
          year: entry.year,
          monthNumber: entry.monthNumber,
        });
      }
    }

    return [...merged.values()].sort((a, b) => a.year - b.year || a.monthNumber - b.monthNumber);
  }

  private mapSeries(keys: { id: string }[], entries: MonthlyStatistic[]): number[] {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      counts.set(`${entry.year}-${entry.monthNumber}`, entry.count);
    }

    return keys.map((key) => counts.get(key.id) ?? 0);
  }
}
