import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import {
  QuickOrderApiItem,
  QuickOrderListQueryParams,
  QuickOrderListResponse,
} from '../../models/quick-order.model';
import { UpdateQuickOrderPayload } from '../../models/update-quick-order-payload.model';

@Injectable({
  providedIn: 'root',
})
export class QuickOrdersService {
  private readonly http = inject(HttpClient);

  getQuickOrders(query: QuickOrderListQueryParams): Observable<QuickOrderListResponse> {
    return this.http.get<QuickOrderListResponse>(`${API_URL}/quick-orders`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.search ? { search: query.search } : {}),
      },
    });
  }

  updateQuickOrder(id: string, payload: UpdateQuickOrderPayload): Observable<QuickOrderApiItem> {
    return this.http.patch<QuickOrderApiItem>(`${API_URL}/quick-orders/${id}`, payload, {
      withCredentials: true,
    });
  }
}
