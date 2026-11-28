import { Component, computed, inject, input, output, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { InsightList } from '@ui/insight-list/insight-list';
import { RadioGroup } from '@ui/radio-group/radio-group';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOP_QUERY_KEYS } from '../../../../constants/shop-query-keys.constants';
import {
  PRODUCT_REPORT_DEAD_STOCK_DAYS_OPTIONS,
  PRODUCT_REPORT_DEFAULT_DEAD_STOCK_DAYS,
  PRODUCT_REPORT_DEFAULT_LIMIT,
  PRODUCT_REPORT_LIMIT_OPTIONS,
  PRODUCT_REPORT_TEXTS,
} from '../../constants/product-report.constants';
import { REPORTS_ICONS, REPORTS_TEXTS } from '../../constants/reports.constants';
import { buildProductReportView } from '../../helpers/product-report-mapping/product-report-mapping.helper';
import { ReportOption } from '../../models/report-option.model';
import { ReportPeriod } from '../../models/report-period.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { AbcSummary } from './components/abc-summary/abc-summary';
import { DeadStockTable } from './components/dead-stock-table/dead-stock-table';
import { ProductTrends } from './components/product-trends/product-trends';
import { TopProductsTable } from './components/top-products-table/top-products-table';

/** «Товари» tab: ABC analysis, ranking, trends and dead stock. */
@Component({
  selector: 'app-product-report',
  imports: [
    RadioGroup,
    StateMessage,
    InsightList,
    AbcSummary,
    TopProductsTable,
    ProductTrends,
    DeadStockTable,
  ],
  templateUrl: './product-report.html',
  styleUrl: './product-report.scss',
})
export class ProductReport {
  private readonly reportsService = inject(FinanceReportsService);

  public readonly shopId = input.required<string>();
  public readonly period = input.required<ReportPeriod>();
  public readonly openProduct = output<string>();

  protected readonly textData = PRODUCT_REPORT_TEXTS;
  protected readonly reportsTextData = REPORTS_TEXTS;
  protected readonly icons = REPORTS_ICONS;
  protected readonly limitOptions = PRODUCT_REPORT_LIMIT_OPTIONS;
  protected readonly deadStockDaysOptions = PRODUCT_REPORT_DEAD_STOCK_DAYS_OPTIONS;

  protected readonly limit = signal(PRODUCT_REPORT_DEFAULT_LIMIT);
  protected readonly deadStockDays = signal(PRODUCT_REPORT_DEFAULT_DEAD_STOCK_DAYS);

  protected readonly reportQuery = injectQuery(() => {
    const shopId = this.shopId();
    const period = this.period();
    const limit = this.limit();
    const deadStockDays = this.deadStockDays();
    return {
      queryKey: SHOP_QUERY_KEYS.productReport(shopId, period, limit, deadStockDays),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.reportsService.getProductReport({ shopId, ...period, limit, deadStockDays }),
        ),
    };
  });

  protected readonly isLoading = computed(() => this.reportQuery.isPending());
  protected readonly hasError = computed(() => this.reportQuery.isError());
  protected readonly view = computed(() =>
    buildProductReportView(this.reportQuery.data(), this.deadStockDays()),
  );

  protected onLimitChange(value: string | number | boolean): void {
    this.setOption(this.limitOptions, value, (limit) => this.limit.set(limit));
  }

  protected onDeadStockDaysChange(value: string | number | boolean): void {
    this.setOption(this.deadStockDaysOptions, value, (days) => this.deadStockDays.set(days));
  }

  private setOption(
    options: ReportOption<number>[],
    value: string | number | boolean,
    apply: (next: number) => void,
  ): void {
    const option = options.find((item) => item.value === value);
    if (option) {
      apply(option.value);
    }
  }
}
