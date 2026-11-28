import { Component, computed, inject, input } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { InsightList } from '@ui/insight-list/insight-list';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOP_QUERY_KEYS } from '../../../../constants/shop-query-keys.constants';
import { REPORTS_ICONS, REPORTS_TEXTS } from '../../constants/reports.constants';
import { buildCustomerReportView } from '../../helpers/customer-report-mapping/customer-report-mapping.helper';
import { ReportPeriod } from '../../models/report-period.model';
import { FinanceReportsService } from '../../services/finance-reports/finance-reports.service';
import { ReportKpiGrid } from '../report-kpi-grid/report-kpi-grid';
import { CustomerSegments } from './components/customer-segments/customer-segments';
import { NewReturningSplit } from './components/new-returning-split/new-returning-split';

/** «Клієнти» tab: LTV, repeat rate, new vs returning revenue and RFM segments. */
@Component({
  selector: 'app-customer-report',
  imports: [StateMessage, InsightList, ReportKpiGrid, NewReturningSplit, CustomerSegments],
  templateUrl: './customer-report.html',
  styleUrl: './customer-report.scss',
})
export class CustomerReport {
  private readonly reportsService = inject(FinanceReportsService);

  public readonly shopId = input.required<string>();
  public readonly period = input.required<ReportPeriod>();

  protected readonly reportsTextData = REPORTS_TEXTS;
  protected readonly icons = REPORTS_ICONS;

  protected readonly reportQuery = injectQuery(() => {
    const shopId = this.shopId();
    const period = this.period();
    return {
      queryKey: SHOP_QUERY_KEYS.customerReport(shopId, period),
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.reportsService.getCustomerReport({ shopId, ...period })),
    };
  });

  protected readonly isLoading = computed(() => this.reportQuery.isPending());
  protected readonly hasError = computed(() => this.reportQuery.isError());
  protected readonly view = computed(() => buildCustomerReportView(this.reportQuery.data()));
}
