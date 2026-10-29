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
import { SHOP_STATISTICS_TEXTS } from '../../constants/shop-statistics.constants';
import {
  buildStatisticChartData,
  buildStatisticChartOptions,
} from '../../helpers/shop-statistics-chart.helper';
import { ShopStatisticService } from '../../services/shop-statistic.service';

@Component({
  selector: 'app-shop-statistics',
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
      queryKey: shopId ? SHOP_QUERY_KEYS.statistic(shopId) : SHOP_QUERY_KEYS.disabled('statistic'),
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.statisticService.getStatistic(shopId)),
    };
  });

  protected readonly isLoading = computed(
    () => this.statisticQuery.isPending() || this.statisticQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.statisticQuery.isError());
  private readonly chartData = computed(() => buildStatisticChartData(this.statisticQuery.data()));
  protected readonly hasData = computed(() => this.chartData().categories.length > 0);

  constructor() {
    // Highcharts lives outside Angular: create the chart once, then update it in place.
    effect(() => {
      const container = this.chartContainer()?.nativeElement;
      if (!container || !this.hasData()) {
        return;
      }

      const options = buildStatisticChartOptions(this.chartData());
      if (this.chart) {
        this.chart.update(options, true, true);
      } else {
        this.chart = Highcharts.chart(container, options);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.chart?.destroy();
      this.chart = null;
    });
  }
}
