import { Component, computed, inject, input, output, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { InsightList } from '@ui/insight-list/insight-list';
import { RadioGroup } from '@ui/radio-group/radio-group';
import { StateMessage } from '@ui/state-message/state-message';
import { Switch } from '@ui/switch/switch';
import { SHOP_QUERY_KEYS } from '../../../../constants/shop-query-keys.constants';
import { REPORTS_FIELD_IDS, REPORTS_ICONS, REPORTS_TEXTS } from '../../constants/reports.constants';
import {
  REVENUE_DEFAULT_GROUP_BY,
  REVENUE_GRANULARITY_TITLES,
  REVENUE_GROUP_BY_OPTIONS,
  REVENUE_REPORT_TEXTS,
} from '../../constants/revenue-report.constants';
import { buildRevenueReportView } from '../../helpers/revenue-report-mapping/revenue-report-mapping.helper';
import { ReportGroupBy } from '../../models/report-group-by.type';
import { ReportPeriod } from '../../models/report-period.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { ReportKpiGrid } from '../report-kpi-grid/report-kpi-grid';
import { RevenueBreakdown } from './components/revenue-breakdown/revenue-breakdown';
import { RevenueHighlightCard } from './components/revenue-highlight-card/revenue-highlight-card';
import { RevenueTimelineChart } from './components/revenue-timeline-chart/revenue-timeline-chart';

/** «Виручка» tab: KPIs vs the previous period, timeline and breakdowns. */
@Component({
  selector: 'app-revenue-report',
  imports: [
    RadioGroup,
    Switch,
    StateMessage,
    InsightList,
    ReportKpiGrid,
    RevenueHighlightCard,
    RevenueTimelineChart,
    RevenueBreakdown,
  ],
  templateUrl: './revenue-report.html',
  styleUrl: './revenue-report.scss',
})
export class RevenueReport {
  private readonly reportsService = inject(FinanceReportsService);

  public readonly shopId = input.required<string>();
  public readonly period = input.required<ReportPeriod>();
  public readonly openOrders = output<void>();

  protected readonly textData = REVENUE_REPORT_TEXTS;
  protected readonly reportsTextData = REPORTS_TEXTS;
  protected readonly icons = REPORTS_ICONS;
  protected readonly fieldIds = REPORTS_FIELD_IDS;
  protected readonly groupByOptions = REVENUE_GROUP_BY_OPTIONS;

  protected readonly groupBy = signal<ReportGroupBy>(REVENUE_DEFAULT_GROUP_BY);
  protected readonly compare = signal(true);

  protected readonly reportQuery = injectQuery(() => {
    const shopId = this.shopId();
    const period = this.period();
    const groupBy = this.groupBy();
    return {
      queryKey: SHOP_QUERY_KEYS.revenueReport(shopId, period, groupBy),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.reportsService.getRevenueReport({
            shopId,
            ...period,
            ...(groupBy === 'auto' ? {} : { groupBy }),
          }),
        ),
    };
  });

  protected readonly isLoading = computed(() => this.reportQuery.isPending());
  protected readonly hasError = computed(() => this.reportQuery.isError());
  protected readonly view = computed(() => buildRevenueReportView(this.reportQuery.data()));
  protected readonly chartTitle = computed(() => {
    const view = this.view();
    return view
      ? `${this.textData.CHART_TITLE} ${REVENUE_GRANULARITY_TITLES[view.granularity]}`
      : this.textData.CHART_TITLE;
  });
  protected readonly compareLabel = computed(() =>
    `${this.textData.COMPARE_LABEL} ${this.view()?.previousRangeLabel ?? ''}`.trim(),
  );

  protected onGroupByChange(value: string | number | boolean): void {
    const option = this.groupByOptions.find((item) => item.value === value);
    if (option) {
      this.groupBy.set(option.value);
    }
  }

  protected onCompareChange(checked: boolean): void {
    this.compare.set(checked);
  }
}
