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
import Highcharts from 'highcharts';
import { SectionCard } from '@ui/section-card/section-card';
import {
  REVENUE_REPORT_ICONS,
  REVENUE_REPORT_TEXTS,
} from '../../../../constants/revenue-report.constants';
import { buildRevenueChartOptions } from '../../../../helpers/revenue-chart/revenue-chart.helper';
import { RevenueChartData } from '../../../../models/revenue-report-view.model';

@Component({
  selector: 'app-revenue-timeline-chart',
  imports: [SectionCard],
  templateUrl: './revenue-timeline-chart.html',
  styleUrl: './revenue-timeline-chart.scss',
})
export class RevenueTimelineChart {
  private readonly destroyRef = inject(DestroyRef);

  public readonly data = input.required<RevenueChartData>();
  public readonly title = input.required<string>();
  public readonly description = input<string>('');

  protected readonly textData = REVENUE_REPORT_TEXTS;
  protected readonly icon = REVENUE_REPORT_ICONS.CHART;
  protected readonly hasData = computed(() => this.data().categories.length > 0);

  private readonly chartContainer = viewChild<ElementRef<HTMLElement>>('chartContainer');
  private chart: Highcharts.Chart | null = null;

  constructor() {
    // Highcharts lives outside Angular: create the chart once, then update it in place.
    effect(() => {
      const container = this.chartContainer()?.nativeElement;
      if (!container) {
        this.destroyChart();
        return;
      }

      const options = buildRevenueChartOptions(this.data());
      if (this.chart) {
        this.chart.update(options, true, true);
      } else {
        this.chart = Highcharts.chart(container, options);
      }
    });

    this.destroyRef.onDestroy(() => this.destroyChart());
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
