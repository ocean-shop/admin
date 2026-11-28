import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { injectQueryParam, injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { StateMessage } from '@ui/state-message/state-message';
import { Tabs } from '@ui/tabs/tabs';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import { ORDERS_SECTION_PATH } from '../orders/constants/orders.constants';
import { PRODUCTS_SECTION_PATH } from '../products/constants/products.constants';
import { CustomerReport } from './components/customer-report/customer-report';
import { ProductReport } from './components/product-report/product-report';
import { ReportPeriodFilter } from './components/report-period-filter/report-period-filter';
import { RevenueReport } from './components/revenue-report/revenue-report';
import {
  REPORTS_DEFAULT_PRESET,
  REPORTS_TAB_QUERY_PARAM,
  REPORTS_TABS,
  REPORTS_TEXTS,
} from './constants/reports.constants';
import { buildPresetPeriod, resolveReportTab } from './helpers/report-period/report-period.helper';
import { ReportPeriodSelection } from './models/report-period-selection.model';

@Component({
  selector: 'app-reports',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    Tabs,
    ReportPeriodFilter,
    RevenueReport,
    ProductReport,
    CustomerReport,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly textData = REPORTS_TEXTS;
  protected readonly tabs = REPORTS_TABS;

  protected readonly shopId = injectRouteParam('shopId');
  private readonly tabParam = injectQueryParam(REPORTS_TAB_QUERY_PARAM);
  protected readonly activeTab = computed(() => resolveReportTab(this.tabParam()));

  /** Shared by every tab, so switching tabs keeps the chosen dates. */
  protected readonly selection = signal<ReportPeriodSelection>({
    period: buildPresetPeriod(REPORTS_DEFAULT_PRESET),
    preset: REPORTS_DEFAULT_PRESET,
  });
  protected readonly period = computed(() => this.selection().period);

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), REPORTS_TEXTS.PAGE_TITLE),
  );

  protected onTabChange(tab: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [REPORTS_TAB_QUERY_PARAM]: resolveReportTab(tab) },
      queryParamsHandling: 'merge',
    });
  }

  protected onSelectionChange(selection: ReportPeriodSelection): void {
    this.selection.set(selection);
  }

  protected onOpenOrders(): void {
    this.navigateInShop([ORDERS_SECTION_PATH]);
  }

  protected onOpenProduct(productId: string): void {
    this.navigateInShop([PRODUCTS_SECTION_PATH, productId]);
  }

  private navigateInShop(path: string[]): void {
    const shopId = this.shopId();
    if (shopId) {
      void this.router.navigate([APP_ROUTES.ADMIN_SHOP, shopId, ...path]);
    }
  }
}
