import { Component, computed, inject, input, output, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { StateMessage } from '@ui/state-message/state-message';
import { Switch } from '@ui/switch/switch';
import { SHOP_QUERY_KEYS } from '../../../../constants/shop-query-keys.constants';
import {
  QUICK_ORDER_REPORT_ICONS,
  QUICK_ORDER_REPORT_TEXTS,
} from '../../constants/quick-order-report.constants';
import { REPORTS_FIELD_IDS, REPORTS_TEXTS } from '../../constants/reports.constants';
import { buildQuickOrderReportView } from '../../helpers/quick-order-report-mapping/quick-order-report-mapping.helper';
import { ReportPeriod } from '../../models/report-period.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { ReportKpiGrid } from '../report-kpi-grid/report-kpi-grid';
import { RevenueHighlightCard } from '../revenue-report/components/revenue-highlight-card/revenue-highlight-card';
import { QuickOrderProductsTable } from './components/quick-order-products-table/quick-order-products-table';
import { QuickOrderStatusSplit } from './components/quick-order-status-split/quick-order-status-split';

/** «Швидкі замовлення» tab: «buy in one click» requests by status, estimated value, top products. */
@Component({
  selector: 'app-quick-order-report',
  imports: [
    Switch,
    StateMessage,
    ReportKpiGrid,
    RevenueHighlightCard,
    QuickOrderStatusSplit,
    QuickOrderProductsTable,
  ],
  templateUrl: './quick-order-report.html',
  styleUrl: './quick-order-report.scss',
})
export class QuickOrderReport {
  private readonly reportsService = inject(FinanceReportsService);

  public readonly shopId = input.required<string>();
  public readonly period = input.required<ReportPeriod>();
  public readonly openProduct = output<string>();
  public readonly openQuickOrders = output<void>();

  protected readonly textData = QUICK_ORDER_REPORT_TEXTS;
  protected readonly reportsTextData = REPORTS_TEXTS;
  protected readonly icons = QUICK_ORDER_REPORT_ICONS;
  protected readonly fieldIds = REPORTS_FIELD_IDS;

  protected readonly compare = signal(true);

  protected readonly reportQuery = injectQuery(() => {
    const shopId = this.shopId();
    const period = this.period();
    return {
      queryKey: SHOP_QUERY_KEYS.quickOrderReport(shopId, period),
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.reportsService.getQuickOrderReport({ shopId, ...period })),
    };
  });

  protected readonly isLoading = computed(() => this.reportQuery.isPending());
  protected readonly hasError = computed(() => this.reportQuery.isError());
  protected readonly view = computed(() => buildQuickOrderReportView(this.reportQuery.data()));
  protected readonly compareLabel = computed(() =>
    `${this.textData.COMPARE_LABEL} ${this.view()?.previousRangeLabel ?? ''}`.trim(),
  );

  protected onCompareChange(checked: boolean): void {
    this.compare.set(checked);
  }
}
