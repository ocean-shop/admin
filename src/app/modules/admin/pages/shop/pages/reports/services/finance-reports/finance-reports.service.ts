import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { CustomerReportApi } from '../../models/customer-report-api.model';
import { ProductReportApi } from '../../models/product-report-api.model';
import { QuickOrderReportApi } from '../../models/quick-order-report-api.model';
import {
  ProductReportQuery,
  ReportQuery,
  RevenueReportQuery,
} from '../../models/report-query.model';
import { RevenueReportApi } from '../../models/revenue-report-api.model';

@Injectable({
  providedIn: 'root',
})
export class FinanceReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_URL}/finance/reports`;

  getRevenueReport(query: RevenueReportQuery): Observable<RevenueReportApi> {
    return this.http.get<RevenueReportApi>(`${this.baseUrl}/revenue`, {
      withCredentials: true,
      params: {
        ...this.buildPeriodParams(query),
        ...(query.groupBy ? { groupBy: query.groupBy } : {}),
      },
    });
  }

  getProductReport(query: ProductReportQuery): Observable<ProductReportApi> {
    return this.http.get<ProductReportApi>(`${this.baseUrl}/products`, {
      withCredentials: true,
      params: {
        ...this.buildPeriodParams(query),
        limit: query.limit,
        deadStockDays: query.deadStockDays,
      },
    });
  }

  getCustomerReport(query: ReportQuery): Observable<CustomerReportApi> {
    return this.http.get<CustomerReportApi>(`${this.baseUrl}/customers`, {
      withCredentials: true,
      params: this.buildPeriodParams(query),
    });
  }

  getQuickOrderReport(query: ReportQuery): Observable<QuickOrderReportApi> {
    return this.http.get<QuickOrderReportApi>(`${this.baseUrl}/quick-orders`, {
      withCredentials: true,
      params: this.buildPeriodParams(query),
    });
  }

  private buildPeriodParams(query: ReportQuery): ReportQuery {
    return { shopId: query.shopId, from: query.from, to: query.to };
  }
}
